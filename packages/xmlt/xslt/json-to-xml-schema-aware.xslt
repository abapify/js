<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:map="http://www.w3.org/2005/xpath-functions/map"
                xmlns:array="http://www.w3.org/2005/xpath-functions/array"
                exclude-result-prefixes="xs map array">

  <xsl:output method="xml" indent="yes" omit-xml-declaration="no"/>

  <!-- Input: JSON string parameter -->
  <xsl:param name="json-input" as="xs:string" required="yes"/>

  <!-- Parse JSON and extract data -->
  <xsl:variable name="json" select="parse-json($json-input)"/>

  <!-- Extract schema path from @metadata -->
  <xsl:variable name="schema-path" select="$json?('@metadata')?schema" as="xs:string?"/>

  <!-- Load instructions dynamically from JSON metadata -->
  <xsl:variable name="instructions" select="
      if (exists($schema-path) and $schema-path != '')
      then parse-json(unparsed-text($schema-path))
      else map{}
  "/>

  <!-- Extract namespaces and rules from instructions -->
  <xsl:variable name="namespaces" select="$instructions?namespaces" as="map(*)?"/>
  <xsl:variable name="rules" select="$instructions?rules" as="array(*)?"/>

  <!-- Main template: process the root JSON object -->
  <xsl:template match="/" name="xsl:initial-template">
    <xsl:choose>
      <xsl:when test="not(exists($instructions) and map:size($instructions) > 0)">
        <xsl:message terminate="yes">ERROR: No schema metadata found or schema file could not be loaded from: <xsl:value-of select="$schema-path"/></xsl:message>
      </xsl:when>
      <xsl:otherwise>
        <!-- Process all keys except @metadata -->
        <xsl:for-each select="map:keys($json)[. != '@metadata']">
          <xsl:variable name="key" select="."/>
          <xsl:variable name="value" select="$json($key)"/>
          <xsl:call-template name="process-element">
            <xsl:with-param name="name" select="$key"/>
            <xsl:with-param name="value" select="$value"/>
            <xsl:with-param name="context-path" select="''"/>
          </xsl:call-template>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Process an element (map or atomic value) -->
  <xsl:template name="process-element">
    <xsl:param name="name" as="xs:string"/>
    <xsl:param name="value"/>
    <xsl:param name="context-path" as="xs:string"/>

    <!-- Build current path for rule matching -->
    <xsl:variable name="current-path" select="
      if ($context-path = '')
      then $name
      else concat($context-path, '/', $name)
    "/>

    <!-- Find matching rule for this element -->
    <xsl:variable name="matching-rule" as="map(*)?">
      <xsl:call-template name="find-matching-rule">
        <xsl:with-param name="element-name" select="$name"/>
        <xsl:with-param name="context-path" select="$context-path"/>
        <xsl:with-param name="value" select="$value"/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Get element configuration from rule -->
    <xsl:variable name="elem-config" select="$matching-rule?element" as="map(*)?"/>
    <xsl:variable name="elem-name" select="($elem-config?name, $name)[1]" as="xs:string"/>
    <xsl:variable name="elem-ns" select="$elem-config?namespace" as="xs:string?"/>
    <xsl:variable name="elem-ns-uri" select="if ($elem-ns) then $namespaces($elem-ns) else ()" as="xs:string?"/>
    <xsl:variable name="ns-declarations" select="$elem-config?declare" as="map(*)?"/>

    <!-- Create element with proper namespace -->
    <xsl:element name="{if ($elem-ns-uri) then concat($elem-ns, ':', $elem-name) else $elem-name}"
                 namespace="{$elem-ns-uri}">

      <!-- Declare namespaces if specified -->
      <xsl:if test="exists($ns-declarations)">
        <xsl:for-each select="map:keys($ns-declarations)">
          <xsl:variable name="prefix" select="."/>
          <xsl:variable name="uri" select="$ns-declarations($prefix)"/>
          <xsl:namespace name="{$prefix}" select="$uri"/>
        </xsl:for-each>
      </xsl:if>

      <!-- Process attributes if value is a map -->
      <xsl:if test="$value instance of map(*)">
        <xsl:call-template name="process-attributes">
          <xsl:with-param name="map" select="$value"/>
          <xsl:with-param name="rule" select="$matching-rule"/>
        </xsl:call-template>
      </xsl:if>

      <!-- Process children if value is a map -->
      <xsl:if test="$value instance of map(*)">
        <xsl:call-template name="process-children">
          <xsl:with-param name="map" select="$value"/>
          <xsl:with-param name="rule" select="$matching-rule"/>
          <xsl:with-param name="context-path" select="$current-path"/>
        </xsl:call-template>
      </xsl:if>

      <!-- Output atomic value as text content -->
      <xsl:if test="not($value instance of map(*)) and not($value instance of array(*))">
        <xsl:value-of select="$value"/>
      </xsl:if>
    </xsl:element>
  </xsl:template>

  <!-- Process attributes from a map -->
  <xsl:template name="process-attributes">
    <xsl:param name="map" as="map(*)"/>
    <xsl:param name="rule" as="map(*)?"/>

    <xsl:variable name="attr-config" select="$rule?attributes" as="map(*)?"/>
    <xsl:variable name="attr-select" select="$attr-config?select" as="xs:string?"/>
    <xsl:variable name="attr-ns" select="$attr-config?namespace" as="xs:string?"/>
    <xsl:variable name="attr-ns-uri" select="if ($attr-ns) then $namespaces($attr-ns) else ()" as="xs:string?"/>

    <!-- If no attribute selection rule, skip -->
    <xsl:if test="exists($attr-select)">
      <!-- Get all keys that should be attributes -->
      <xsl:variable name="attr-keys" as="xs:string*">
        <xsl:choose>
          <!-- If select is "*", include all scalar properties -->
          <xsl:when test="$attr-select = '*'">
            <xsl:sequence select="map:keys($map)[not($map(.) instance of map(*)) and not($map(.) instance of array(*))]"/>
          </xsl:when>
          <!-- Parse the select expression and filter keys -->
          <xsl:otherwise>
            <!-- For now, support simple patterns like "*[not(local-name() = ('link', 'attributes'))]" -->
            <xsl:variable name="excluded-names" select="
              if (contains($attr-select, 'not(local-name() = ('))
              then tokenize(substring-before(substring-after($attr-select, 'not(local-name() = ('), '))'), ',') ! replace(., '[''&quot;\s]', '')
              else ()
            " as="xs:string*"/>

            <xsl:sequence select="
              map:keys($map)[
                not($map(.) instance of map(*)) and
                not($map(.) instance of array(*)) and
                (if (count($excluded-names) > 0) then not(. = $excluded-names) else true())
              ]
            "/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Sort keys according to order if specified -->
      <xsl:variable name="attr-order" select="$attr-config?order" as="array(*)?"/>
      <xsl:variable name="sorted-attr-keys" as="xs:string*">
        <xsl:choose>
          <xsl:when test="exists($attr-order)">
            <!--  Convert array to sequence for comparison -->
            <xsl:variable name="order-seq" as="xs:string*">
              <xsl:for-each select="1 to array:size($attr-order)">
                <xsl:sequence select="array:get($attr-order, .)"/>
              </xsl:for-each>
            </xsl:variable>
            <xsl:for-each select="$attr-keys">
              <xsl:sort select="
                if (. = $order-seq)
                then index-of($order-seq, .)
                else 999
              " data-type="number"/>
              <xsl:sequence select="."/>
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <xsl:sequence select="$attr-keys"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <!-- Create attributes in specified order -->
      <xsl:for-each select="$sorted-attr-keys[exists($map(.))]">
        <xsl:variable name="attr-name" select="."/>
        <xsl:variable name="attr-value" select="$map($attr-name)"/>
        <xsl:choose>
          <xsl:when test="exists($attr-ns-uri) and $attr-ns-uri != ''">
            <xsl:attribute name="{$attr-ns}:{$attr-name}" namespace="{$attr-ns-uri}" select="$attr-value"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="{$attr-name}" select="$attr-value"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>

  <!-- Process children from a map -->
  <xsl:template name="process-children">
    <xsl:param name="map" as="map(*)"/>
    <xsl:param name="rule" as="map(*)?"/>
    <xsl:param name="context-path" as="xs:string"/>

    <xsl:variable name="children-config" select="$rule?children" as="map(*)?"/>
    <xsl:variable name="children-select" select="$children-config?select" as="xs:string?"/>
    <xsl:variable name="children-order" select="$children-config?orderBy" as="xs:string?"/>

    <!-- Get all keys that should be child elements -->
    <xsl:variable name="child-keys" as="xs:string*">
      <xsl:choose>
        <!-- If no children config, process all complex properties -->
        <xsl:when test="not(exists($children-select))">
          <xsl:sequence select="map:keys($map)[$map(.) instance of map(*) or $map(.) instance of array(*)]"/>
        </xsl:when>
        <!-- If select is "*", include all complex properties -->
        <xsl:when test="$children-select = '*'">
          <xsl:sequence select="map:keys($map)[$map(.) instance of map(*) or $map(.) instance of array(*)]"/>
        </xsl:when>
        <!-- Parse the select expression and filter keys -->
        <xsl:otherwise>
          <!-- Support patterns like "*[local-name() = ('link', 'attributes')]" -->
          <xsl:variable name="included-names" select="
            if (contains($children-select, 'local-name() = ('))
            then tokenize(substring-before(substring-after($children-select, 'local-name() = ('), '))'), ',') ! replace(., '[''&quot;\s]', '')
            else ()
          " as="xs:string*"/>

          <xsl:sequence select="
            map:keys($map)[
              ($map(.) instance of map(*) or $map(.) instance of array(*)) and
              (if (count($included-names) > 0) then . = $included-names else true())
            ]
          "/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Sort child keys if orderBy is specified -->
    <xsl:variable name="sorted-child-keys" as="xs:string*">
      <xsl:choose>
        <xsl:when test="exists($children-order) and $children-order != ''">
          <!-- Parse orderBy expression like "index-of(('link', 'attributes'), local-name())" -->
          <xsl:variable name="order-list" select="
            if (contains($children-order, 'index-of(('))
            then tokenize(substring-before(substring-after($children-order, 'index-of(('), '))'), ',') ! replace(., '[''&quot;\s]', '')
            else ()
          " as="xs:string*"/>

          <xsl:for-each select="$child-keys">
            <xsl:sort select="
              if (count($order-list) > 0 and . = $order-list)
              then index-of($order-list, .)
              else 999
            " data-type="number"/>
            <xsl:sequence select="."/>
          </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
          <xsl:sequence select="$child-keys"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!-- Process each child -->
    <xsl:for-each select="$sorted-child-keys">
      <xsl:variable name="key" select="."/>
      <xsl:variable name="value" select="$map($key)"/>

      <xsl:choose>
        <!-- If value is an array, process each item -->
        <xsl:when test="$value instance of array(*)">
          <xsl:for-each select="1 to array:size($value)">
            <xsl:call-template name="process-element">
              <xsl:with-param name="name" select="$key"/>
              <xsl:with-param name="value" select="array:get($value, .)"/>
              <xsl:with-param name="context-path" select="$context-path"/>
            </xsl:call-template>
          </xsl:for-each>
        </xsl:when>
        <!-- Otherwise process as single element -->
        <xsl:otherwise>
          <xsl:call-template name="process-element">
            <xsl:with-param name="name" select="$key"/>
            <xsl:with-param name="value" select="$value"/>
            <xsl:with-param name="context-path" select="$context-path"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:for-each>
  </xsl:template>

  <!-- Find matching rule for an element -->
  <xsl:template name="find-matching-rule" as="map(*)?">
    <xsl:param name="element-name" as="xs:string"/>
    <xsl:param name="context-path" as="xs:string"/>
    <xsl:param name="value"/>

    <!-- Try each rule until we find a match -->
    <xsl:iterate select="1 to array:size($rules)">
      <xsl:param name="found-rule" as="map(*)?" select="()"/>

      <xsl:on-completion>
        <xsl:sequence select="$found-rule"/>
      </xsl:on-completion>

      <xsl:choose>
        <xsl:when test="exists($found-rule)">
          <xsl:break select="$found-rule"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:variable name="rule" select="array:get($rules, .)" as="map(*)"/>
          <xsl:variable name="when-expr" select="$rule?when" as="xs:string?"/>

          <xsl:variable name="matches" as="xs:boolean">
            <xsl:choose>
              <xsl:when test="not(exists($when-expr))">
                <xsl:sequence select="false()"/>
              </xsl:when>
              <xsl:otherwise>
                <!-- Parse and evaluate the when expression -->
                <!-- Support patterns like:
                     local-name() = 'package'
                     local-name() = ('attributes', 'applicationComponent')
                     and not(parent::*)
                -->
                <xsl:variable name="name-match" select="
                  if (contains($when-expr, 'local-name() = '))
                  then
                    let $name-part := substring-after($when-expr, 'local-name() = ')
                    return
                      if (starts-with($name-part, '('))
                      then
                        (: Handle sequence like ('attributes', 'applicationComponent') :)
                        let $seq-part := substring-before(substring-after($name-part, '('), ')'),
                            $names := tokenize($seq-part, ',') ! replace(., '[''&quot;\s]', '')
                        return $element-name = $names
                      else
                        (: Handle single value like 'package' :)
                        let $quoted-name := replace($name-part, '^[''&quot;]([^''&quot;]+)[''&quot;].*', '$1')
                        return $element-name = $quoted-name
                  else true()
                " as="xs:boolean"/>

                <xsl:variable name="parent-match" select="
                  if (contains($when-expr, 'not(parent::*)'))
                  then $context-path = ''
                  else true()
                " as="xs:boolean"/>

                <xsl:sequence select="$name-match and $parent-match"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>

          <xsl:next-iteration>
            <xsl:with-param name="found-rule" select="if ($matches) then $rule else ()"/>
          </xsl:next-iteration>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:iterate>
  </xsl:template>

</xsl:stylesheet>
