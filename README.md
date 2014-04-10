# MPEG-TS Sections in JavaScript

Author: Brendan Long <b.long@cablelabs.com>

CRC-32 code adapted from the output of [Thomas Pircher's (MIT licensed) pycrc][pycrc].

This library decodes [MPEG-TS program-specific information][mpegts-psi] into JSON. It's intended to be used with [HTML5 DataCues][datacue], but will work in any case where you have an `ArrayBuffer`.

For additional information, you may want to consult the [ISO 13818-1 spec][iso-13818-1].

## Using this library

To use, copy mpegtssections.js into your application's script directory, then add something like this to the `<head>` of your HTML page(s):

    <script src="your-script-directory/mpegtssections.js"></script>

You can then use `MpegTs` methods in your JavaScript code.

## Testing

You can run the tests using Node.js:

    cd ~/mpegtssection-js
    npm install
    npm test # runs unit tests
    npm run-script hint # runs JSHint

See `test/tests.js` for the [Nodeunit][nodeunit] tests.

[JSHint][jshint] follows directives in the `/*jslint ... */` block at the top of each JavaScript file.

## API Documentation

### Data Structures

The following uses [Web IDL][webidl] syntax to describe the resulting data structures. The attribute names are taken directly from the MPEG-TS spec.

#### Generic MPEG-TS Section

    interface MpegTsSyntaxSection {
        attribute unsigned short tableIdExtension;
        attribute octet versionNumber;
        attribute boolean currentNextIndicator;
        attribute octet sectionNumber;
        attribute octet lastSectionNumber;
    }

    interface MpegTsSection {
        attribute octet tableId;
        attribute MpegTsSyntaxSection? syntaxSection;
    }

    interface MpegTsDescriptor {
        attribute octet tag;
        attribute ArrayBuffer data;
    }

#### Program Association Section

See Table 2-25 - Program association section

    interface MpegTsPatProgramInfo {
        attribute unsigned short programNumber;

        // this is the network_PID if programNumber == 0,
        // or the program_map_PID if programNumber != 0
        attribute unsigned short pid;
    }

    interface MpegTsPat implements MpegTsSection {
        attribute unsigned short transportStreamId;
        attribute MpegTsPatProgramInfo[] programInfo;
    }

#### Conditional Access Table

See Table 2-27 - Conditional access section.

    interface MpegTsCat implements MpegTsSection {
        attribute MpegTsDescriptor[] descriptors;
    }

#### Program Map Table

See Table 2-28 - Transport Stream program map section.

    interface MpegTsElementaryStream {
        attribute octet streamType;
        attribute unsigned short elementaryPID;
        attribute MpegTsDescriptor[] descriptors;
    }

    interface MpegTsPmt implements MpegTsSection {
        attribute unsigned short programNumber;
        attribute unsigned short? pcrPID; // 8191 maps to null
        attribute MpegTsDescriptor[] descriptors;
        attribute MpegTsElementaryStreamData[] streams;
    }

#### Private Section

See Table 2-30 - Private Section

    interface MpegTsPrivateSection implements MpegTsSection {
        attribute boolean privateIndicator;
        attribute MpegTsSyntaxSection? syntaxSection;
        ArrayBuffer privateData;
    }

#### Transport Stream Description

See Table 2-30-1 - The Transport Stream Description Table

    interface MpegTsDescriptionSection implements MpegTsSection {
        attribute MpegTsDescriptor[] descriptors;
    }

#### Functions

`String MpegTs.decodeTable(ArrayBuffer buf)`

If `buf` is a PSI table (starting with the `table_id`), it will be decoded into the most appropriate type, using the following algorithm:

 1. If there are any serious problems with the data (lengths are wrong), throw a `BadSizeError`.
 2. If `table_id` is 0, 1, 2, or 3 (PAT, CAT, PMT, Description), throw a `MissingSyntaxSectionError` if `syntax_section_indicator` is not 1.
 3. If `syntax_section_indicator` is 1, throw an `InvalidCrcError` if the CRC-32 of the buffer is not 0.
 4. If the `table_id` is 0, return an `MpegTsPat`.
 5. If the `table_id` is 1, return an `MpegTsCat`.
 6. If the `table_id` is 2, return an `MpegTsPmt`.
 7. If the `table_id` is 3, return an `MpegTsDescriptionSection`.
 8. If the `table_id` is >= 128, return an `MpegTsPrivateSection`.
 9. Return an `MpegTsSection`.

[datacue]: http://www.w3.org/html/wg/drafts/html/CR/embedded-content-0.html#datacue
[iso-13818-1]: http://www.iso.org/iso/home/store/catalogue_ics/catalogue_detail_ics.htm?csnumber=62074
[jshint]: http://www.jshint.com/about/
[mpegts-psi]: http://en.wikipedia.org/wiki/Program-specific_information
[nodeunit]: https://github.com/caolan/nodeunit
[pycrc]: https://github.com/tpircher/pycrc
[webidl]: http://www.w3.org/TR/WebIDL/
