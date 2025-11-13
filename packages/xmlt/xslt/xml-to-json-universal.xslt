<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="text" encoding="UTF-8"/>

    <!--
        UNIVERSAL XML → JSON TRANSFORMER

        This stylesheet converts ANY XML structure to JSON automatically.

        Features:
        - Zero hardcoding - works for any XML document
        - Recursive - handles nested elements automatically
        - Namespace-aware - strips namespace prefixes automatically
        - Type detection - booleans, arrays, objects
        - XSD-agnostic - no schema required

        Usage: Point it at ANY XML document and get clean JSON!
    -->

    <!-- Root template - start transformation -->
    <xsl:template match="/">
        <xsl:apply-templates select="*" mode="to-json"/>
    </xsl:template>

    <!-- Main recursive template: ANY element - JSON object or value -->
    <xsl:template match="*" mode="to-json">
        <xsl:choose>
            <!-- Element with text content only no child elements - output as value -->
            <xsl:when test="not(*) and normalize-space(text())">
                <xsl:choose>
                    <!-- Has attributes - object with attributes plus text -->
                    <xsl:when test="@*">
                        <xsl:text>{</xsl:text>
                        <!-- Process attributes -->
                        <xsl:for-each select="@*">
                            <xsl:text>"</xsl:text>
                            <xsl:value-of select="local-name()"/>
                            <xsl:text>":</xsl:text>
                            <xsl:call-template name="output-value">
                                <xsl:with-param name="value" select="."/>
                            </xsl:call-template>
                            <xsl:text>,</xsl:text>
                        </xsl:for-each>
                        <!-- Add text as underscore text property -->
                        <xsl:text>"_text":</xsl:text>
                        <xsl:call-template name="output-value">
                            <xsl:with-param name="value" select="normalize-space(text())"/>
                        </xsl:call-template>
                        <xsl:text>}</xsl:text>
                    </xsl:when>
                    <!-- No attributes - output text value directly -->
                    <xsl:otherwise>
                        <xsl:call-template name="output-value">
                            <xsl:with-param name="value" select="normalize-space(text())"/>
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>

            <!-- Element with attributes and or child elements - object -->
            <xsl:otherwise>
                <xsl:text>{</xsl:text>

                <!-- Output element name as wrapper if this is root -->
                <xsl:if test="not(parent::*)">
                    <xsl:text>"</xsl:text>
                    <xsl:value-of select="local-name()"/>
                    <xsl:text>":{</xsl:text>
                </xsl:if>

                <!-- Process all attributes any namespace -->
                <xsl:if test="@*">
                    <xsl:for-each select="@*">
                        <xsl:text>"</xsl:text>
                        <xsl:value-of select="local-name()"/>
                        <xsl:text>":</xsl:text>
                        <xsl:call-template name="output-value">
                            <xsl:with-param name="value" select="."/>
                        </xsl:call-template>
                        <xsl:if test="position() != last()">,</xsl:if>
                    </xsl:for-each>
                </xsl:if>

                <!-- Add comma between attributes and child elements -->
                <xsl:if test="@* and *">
                    <xsl:text>,</xsl:text>
                </xsl:if>

                <!-- Process child elements -->
                <xsl:if test="*">
                    <xsl:choose>
                        <!-- Multiple elements with same name - array -->
                        <xsl:when test="*[1][count(../*[local-name() = local-name(current())]) > 1]">
                            <xsl:call-template name="process-children-as-groups"/>
                        </xsl:when>
                        <!-- Single unique elements - objects -->
                        <xsl:otherwise>
                            <xsl:call-template name="process-children-as-objects"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:if>

                <!-- Close wrapper if root -->
                <xsl:if test="not(parent::*)">
                    <xsl:text>}</xsl:text>
                </xsl:if>

                <xsl:text>}</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Process child elements as objects (no grouping) -->
    <xsl:template name="process-children-as-objects">
        <xsl:for-each select="*">
            <xsl:variable name="elem-name" select="local-name()"/>

            <!-- Check if this element appears multiple times -->
            <xsl:variable name="siblings" select="parent::*/*[local-name() = $elem-name]"/>

            <xsl:choose>
                <!-- Multiple siblings with same name → array (only process on first occurrence) -->
                <xsl:when test="count($siblings) > 1 and not(preceding-sibling::*[local-name() = $elem-name])">
                    <xsl:text>"</xsl:text>
                    <xsl:value-of select="local-name()"/>
                    <xsl:text>":[</xsl:text>

                    <xsl:for-each select="$siblings">
                        <xsl:apply-templates select="." mode="to-json"/>
                        <xsl:if test="position() != last()">,</xsl:if>
                    </xsl:for-each>

                    <xsl:text>]</xsl:text>
                    <!-- Check if the LAST sibling in this array has any following siblings -->
                    <xsl:if test="$siblings[last()]/following-sibling::*">,</xsl:if>
                </xsl:when>

                <!-- Single element → object -->
                <xsl:when test="count($siblings) = 1">
                    <xsl:text>"</xsl:text>
                    <xsl:value-of select="local-name()"/>
                    <xsl:text>":</xsl:text>
                    <xsl:apply-templates select="." mode="to-json"/>
                    <xsl:if test="position() != last()">,</xsl:if>
                </xsl:when>

                <!-- Skip if already processed in array -->
                <xsl:otherwise/>
            </xsl:choose>
        </xsl:for-each>
    </xsl:template>

    <!-- Process child elements grouped by name -->
    <xsl:template name="process-children-as-groups">
        <xsl:variable name="parent" select="."/>

        <!-- Get unique element names -->
        <xsl:for-each select="*[not(local-name() = preceding-sibling::*/local-name())]">
            <xsl:variable name="elem-name" select="local-name()"/>
            <xsl:variable name="siblings" select="$parent/*[local-name() = $elem-name]"/>

            <xsl:text>"</xsl:text>
            <xsl:value-of select="$elem-name"/>
            <xsl:text>":</xsl:text>

            <xsl:choose>
                <!-- Multiple → array -->
                <xsl:when test="count($siblings) > 1">
                    <xsl:text>[</xsl:text>
                    <xsl:for-each select="$siblings">
                        <xsl:apply-templates select="." mode="to-json"/>
                        <xsl:if test="position() != last()">,</xsl:if>
                    </xsl:for-each>
                    <xsl:text>]</xsl:text>
                </xsl:when>
                <!-- Single → object -->
                <xsl:otherwise>
                    <xsl:apply-templates select="$siblings[1]" mode="to-json"/>
                </xsl:otherwise>
            </xsl:choose>

            <xsl:if test="position() != last()">,</xsl:if>
        </xsl:for-each>
    </xsl:template>

    <!-- Output typed value (boolean, string, number) -->
    <xsl:template name="output-value">
        <xsl:param name="value"/>

        <xsl:choose>
            <!-- Boolean -->
            <xsl:when test="$value = 'true' or $value = 'false'">
                <xsl:value-of select="$value"/>
            </xsl:when>

            <!-- Number (simple check) -->
            <xsl:when test="number($value) = number($value) and $value != ''">
                <xsl:value-of select="$value"/>
            </xsl:when>

            <!-- Empty string -->
            <xsl:when test="$value = ''">
                <xsl:text>""</xsl:text>
            </xsl:when>

            <!-- String (default) -->
            <xsl:otherwise>
                <xsl:text>"</xsl:text>
                <!-- Escape special characters -->
                <xsl:call-template name="escape-json">
                    <xsl:with-param name="text" select="$value"/>
                </xsl:call-template>
                <xsl:text>"</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Escape JSON special characters -->
    <xsl:template name="escape-json">
        <xsl:param name="text"/>

        <!-- Replace " with \" -->
        <xsl:variable name="escaped-quotes">
            <xsl:call-template name="string-replace">
                <xsl:with-param name="text" select="$text"/>
                <xsl:with-param name="from">"</xsl:with-param>
                <xsl:with-param name="to">\"</xsl:with-param>
            </xsl:call-template>
        </xsl:variable>

        <!-- Replace \ with \\ -->
        <xsl:call-template name="string-replace">
            <xsl:with-param name="text" select="$escaped-quotes"/>
            <xsl:with-param name="from">\</xsl:with-param>
            <xsl:with-param name="to">\\</xsl:with-param>
        </xsl:call-template>
    </xsl:template>

    <!-- String replace helper -->
    <xsl:template name="string-replace">
        <xsl:param name="text"/>
        <xsl:param name="from"/>
        <xsl:param name="to"/>

        <xsl:choose>
            <xsl:when test="contains($text, $from)">
                <xsl:value-of select="substring-before($text, $from)"/>
                <xsl:value-of select="$to"/>
                <xsl:call-template name="string-replace">
                    <xsl:with-param name="text" select="substring-after($text, $from)"/>
                    <xsl:with-param name="from" select="$from"/>
                    <xsl:with-param name="to" select="$to"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$text"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Suppress default text node processing -->
    <xsl:template match="text()"/>

</xsl:stylesheet>
