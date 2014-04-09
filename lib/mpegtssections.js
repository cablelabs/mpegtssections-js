/* Copyright (c) 2014, CableLabs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
/*jslint browser: true, node: true, bitwise: true, plusplus: true, vars: true,
  indent: 4, maxlen: 80 */
(function (exports) {
    "use strict";

    /* Constants */
    var TableIds = {
        PROGRAM_ASSOCIATION_SECTION: 0,
        CONDITIONAL_ACCESS_SECTION: 1,
        TS_PROGRAM_MAP_SECTION: 2,
        TS_DESCRIPTION_SECTION: 3,
        ISO_IEC_14496_SCENE_DESCRIPTION_SECTION: 4,
        ISO_IEC_14496_OBJECT_DESCRIPTION_SECTION: 5
    };

    var ReservedPids = {
        PROGRAM_ASSOCIATION: 0,
        CONDITIONAL_ACCESS: 1,
        TRANSPORT_STREAM_DESCRIPTION: 2
    };

    /* Errors */
    function defineError(name, defaultMessage) {
        function NewError(message) {
            this.name = name;
            this.message = message;
        }
        NewError.prototype = new Error();
        NewError.prototype.constructor = NewError;
        return NewError;
    }
    var BadSizeError = defineError("BadSizeError");
    var MissingSyntaxSectionError = defineError("MissingSyntaxSectionError");

    /* Functions */
    function decodeSection(buf) {
        if (!buf || !(buf instanceof ArrayBuffer)) {
            throw new TypeError("Expected an ArrayBuffer as the first " +
                "argument but got " + typeof buf + ": " + buf);
        }

        if (buf.byteLength < 3) {
            throw new BadSizeError("MPEG-TS sections must be at least 3 " +
                "bytes long, but got buffer with length " + buf.byteLength);
        }

        var view = new DataView(buf);
        // check CRC32?

        var section = {
            table_id: view.getUint8(0),
            private_bit: (view.getUint8(1) & 0x80) === 1,
            section_length: view.getUint16(1) & 0xFFF
        };

        // if section_syntax_indicator is set, parse the syntax section
        if ((view.getUint8(1) & 0x80) >> 7) {
            if (buf.byteLength < 7) {
                throw new BadSizeError("section_syntax_indicator is 1, but " +
                    "the buffer is not long enough to contain a valid " +
                    "syntax section");
            }

            section.syntax_section = {
                table_id_extension: view.getUint16(3),
                version_number: (view.getUint8(5) & 0x3E) >> 1,
                current_next_indicator: (view.getUint8(5) & 1) === 1,
                section_number: view.getUint8(6),
                last_section_number: view.getUint8(7),
                CRC_32: view.getUint32(buf.byteLength - 4) // check this
            };
        } else {
            section.syntax_section = null;
        }

        switch (section.table_id) {
        case TableIds.PROGRAM_ASSOCIATION_SECTION:
            if (!section.syntax_section) {
                throw new MissingSyntaxSectionError("Program access section " +
                    "requires a syntax section, but " +
                    "section_syntax_indicator is 0");
            }
            section.transport_stream_id = view.getUint16(3);
            // program info
            break;
        case TableIds.CONDITIONAL_ACCESS_SECTION:
        case TableIds.TS_DESCRIPTION_SECTION:
            // descriptors
            break;
        case TableIds.TS_PROGRAM_MAP_SECTION:
            section.program_number = view.getUint16(3);
            section.PCR_PID = view.getUint16(8) & 0x1FFF;
            if (section.PCR_PID === 0x1FFF) {
                section.PCR_PID = null;
            }
            section.program_info_length = view.getUint16(10) & 0xFFF;
            section.streams = [];

            var stream_start = 12 + section.program_info_length;
            var streams_end = buf.byteLength - 4 - 5;
            var i = 0;
            while (stream_start <= streams_end) {
                section.streams[i] = {
                    stream_type: view.getUint8(stream_start),
                    elementary_PID: view.getUint16(stream_start + 1) & 0x1FFF,
                    ES_info_length: view.getUint16(stream_start + 3) & 0xFFF
                };
                stream_start += 5 + section.streams[i].ES_info_length;
                ++i;
            }
            break;
        default:
            if (section.table_id >= 128) {
                // private data
            }
            break;
        }
        return section;
    }

    exports.TableIds = TableIds;
    exports.ReservedPids = ReservedPids;

    exports.BadSizeError = BadSizeError;
    exports.MissingSyntaxSectionError = MissingSyntaxSectionError;

    exports.decodeSection = decodeSection;
}(typeof exports === 'undefined' ? this.MpegTs = {} : exports));
