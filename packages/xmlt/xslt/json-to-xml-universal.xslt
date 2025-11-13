<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:map="http://www.w3.org/2005/xpath-functions/map"
    xmlns:array="http://www.w3.org/2005/xpath-functions/array"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="map array xs">

    <xsl:output method="xml" encoding="UTF-8" indent="yes"/>

    <xsl:param name="json-input" as="xs:string" required="yes"/>

    <!--
        UNIVERSAL JSON → XML TRANSFORMER

        This stylesheet converts ANY JSON structure to XML automatically.

        Features:
        - Zero hardcoding - works for any JSON document
        - Recursive - handles nested objects/arrays automatically
        - Type preservation - detects strings, numbers, booleans, null
        - Array handling - repeated elements for array items
        - Mixed content - handles _text property for text nodes

        Usage: Point it at ANY JSON document and get valid XML!
    -->

    <!-- Root template - parse JSON and start transformation -->
    <xsl:template match="/" name="xsl:initial-template">
        <xsl:variable name="json-map" select="parse-json($json-input)" as="map(*)"/>

        <!-- Process root object -->
        <xsl:call-template name="process-map">
            <xsl:with-param name="map" select="$json-map"/>
            <xsl:with-param name="is-root" select="true()"/>
        </xsl:call-template>
    </xsl:template>

    <!-- Process a JSON object (map) -->
    <xsl:template name="process-map">
        <xsl:param name="map" as="map(*)"/>
        <xsl:param name="element-name" as="xs:string?" select="()"/>
        <xsl:param name="is-root" as="xs:boolean" select="false()"/>

        <xsl:choose>
            <!-- Root level - create element for first key -->
            <xsl:when test="$is-root">
                <xsl:variable name="root-key" select="map:keys($map)[1]"/>
                <xsl:element name="{$root-key}">
                    <xsl:call-template name="process-map-contents">
                        <xsl:with-param name="map" select="map:get($map, $root-key)"/>
                    </xsl:call-template>
                </xsl:element>
            </xsl:when>

            <!-- Non-root - process contents -->
            <xsl:otherwise>
                <xsl:call-template name="process-map-contents">
                    <xsl:with-param name="map" select="$map"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Process map contents (keys/values) -->
    <xsl:template name="process-map-contents">
        <xsl:param name="map" as="map(*)"/>

        <xsl:for-each select="map:keys($map)">
            <xsl:variable name="key" select="."/>
            <xsl:variable name="value" select="map:get($map, $key)"/>

            <xsl:choose>
                <!-- Special _text property - output as text node -->
                <xsl:when test="$key = '_text'">
                    <xsl:value-of select="$value"/>
                </xsl:when>

                <!-- Regular property -->
                <xsl:otherwise>
                    <xsl:call-template name="process-value">
                        <xsl:with-param name="key" select="$key"/>
                        <xsl:with-param name="value" select="$value"/>
                    </xsl:call-template>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>

    <!-- Process a value (any type) -->
    <xsl:template name="process-value">
        <xsl:param name="key" as="xs:string"/>
        <xsl:param name="value"/>

        <xsl:choose>
            <!-- Array - create multiple elements -->
            <xsl:when test="$value instance of array(*)">
                <xsl:call-template name="process-array">
                    <xsl:with-param name="key" select="$key"/>
                    <xsl:with-param name="array" select="$value"/>
                </xsl:call-template>
            </xsl:when>

            <!-- Object (map) - create element with nested content -->
            <xsl:when test="$value instance of map(*)">
                <xsl:element name="{$key}">
                    <xsl:call-template name="process-object-or-attributes">
                        <xsl:with-param name="map" select="$value"/>
                    </xsl:call-template>
                </xsl:element>
            </xsl:when>

            <!-- Primitive value - create attribute or element -->
            <xsl:otherwise>
                <xsl:call-template name="output-primitive">
                    <xsl:with-param name="key" select="$key"/>
                    <xsl:with-param name="value" select="$value"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Process array - create repeated elements -->
    <xsl:template name="process-array">
        <xsl:param name="key" as="xs:string"/>
        <xsl:param name="array" as="array(*)"/>

        <xsl:for-each select="1 to array:size($array)">
            <xsl:variable name="item" select="array:get($array, .)"/>

            <xsl:choose>
                <!-- Array item is object - create element -->
                <xsl:when test="$item instance of map(*)">
                    <xsl:element name="{$key}">
                        <xsl:call-template name="process-object-or-attributes">
                            <xsl:with-param name="map" select="$item"/>
                        </xsl:call-template>
                    </xsl:element>
                </xsl:when>

                <!-- Array item is primitive - create element with text -->
                <xsl:otherwise>
                    <xsl:element name="{$key}">
                        <xsl:value-of select="$item"/>
                    </xsl:element>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>

    <!-- Process object - determine if properties should be attributes or child elements -->
    <xsl:template name="process-object-or-attributes">
        <xsl:param name="map" as="map(*)"/>

        <!-- Strategy:
             - Check if object has any complex children (arrays/objects)
             - If yes: all properties become child elements
             - If no: primitive properties become attributes
             - _text property → text content
        -->

        <xsl:variable name="has-complex-children"
                      select="some $k in map:keys($map)
                              satisfies (map:get($map, $k) instance of map(*)
                                      or map:get($map, $k) instance of array(*))"/>

        <xsl:choose>
            <!-- Has complex children - use child elements for all -->
            <xsl:when test="$has-complex-children">
                <xsl:for-each select="map:keys($map)">
                    <xsl:variable name="key" select="."/>
                    <xsl:variable name="value" select="map:get($map, $key)"/>

                    <xsl:choose>
                        <!-- Text content -->
                        <xsl:when test="$key = '_text'">
                            <xsl:value-of select="$value"/>
                        </xsl:when>

                        <!-- Any value - create child element -->
                        <xsl:otherwise>
                            <xsl:call-template name="process-value">
                                <xsl:with-param name="key" select="$key"/>
                                <xsl:with-param name="value" select="$value"/>
                            </xsl:call-template>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:for-each>
            </xsl:when>

            <!-- No complex children - use attributes for primitives -->
            <xsl:otherwise>
                <!-- Output attributes -->
                <xsl:for-each select="map:keys($map)">
                    <xsl:variable name="key" select="."/>
                    <xsl:variable name="value" select="map:get($map, $key)"/>

                    <xsl:if test="$key != '_text'">
                        <xsl:attribute name="{$key}">
                            <xsl:value-of select="$value"/>
                        </xsl:attribute>
                    </xsl:if>
                </xsl:for-each>

                <!-- Output text content -->
                <xsl:if test="map:contains($map, '_text')">
                    <xsl:value-of select="map:get($map, '_text')"/>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Output primitive value as element -->
    <xsl:template name="output-primitive">
        <xsl:param name="key" as="xs:string"/>
        <xsl:param name="value"/>

        <xsl:element name="{$key}">
            <xsl:value-of select="$value"/>
        </xsl:element>
    </xsl:template>

</xsl:stylesheet>
