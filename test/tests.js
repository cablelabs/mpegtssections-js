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
/*jslint browser: true, node: true, plusplus: true, vars: true, indent: 4 */
"use strict";
var MpegTs = require('../lib/mpegtssections');

function arrayBufferToArray(buf) {
    var result = [];
    var asArray = new Uint8Array(buf);
    for (var i = 0; i < asArray.length; ++i) {
        result[i] = asArray[i];
    }
    return result;
}

exports.TestBufArgumentNull = function(test) {
    test.throws(function() {
        MpegTs.decodeSection(null);
    }, TypeError);
    test.done();
};

exports.TestBufArgumentUndefined = function(test) {
    test.throws(function() {
        MpegTs.decodeSection();
    }, TypeError);
    test.done();
};

exports.testBufArgumentWrongType = function(test) {
    test.throws(function() {
        MpegTs.decodeSection([5]);
    }, TypeError);
    test.done();
};

exports.testBufArgumentTooSmall = function(test) {
    test.throws(function() {
        var data = new Uint8Array([1, 2]).buffer;
        MpegTs.decodeSection(data);
    }, MpegTs.BadSizeError);
    test.done();
};

exports.testBufLessThanSectionLength = function(test) {
    test.throws(function() {
        var data = new Uint8Array([0, 176, 13, 0, 1, 193, 0, 0, 0, 2, 224, 32, 160, 170, 220]).buffer;
        MpegTs.decodeSection(data);
    }, MpegTs.BadSizeError);
    test.done();
};

exports.testBufGreaterThanSectionLength = function(test) {
    test.throws(function() {
        var data = new Uint8Array([0, 176, 13, 0, 1, 193, 0, 0, 0, 2, 224, 32, 160, 170, 220, 0, 0]).buffer;
        MpegTs.decodeSection(data);
    }, MpegTs.BadSizeError);
    test.done();
};

exports.TestPAT = function(test) {
    var data = new Uint8Array([0, 176, 13, 0, 1, 193, 0, 0, 0, 2, 224, 32, 160, 170, 220, 200]).buffer;
    var section = MpegTs.decodeSection(data);

    test.equal(section.table_id, 0, "table_id");
    test.equal(section.private_indicator, 0, "private_indicator");

    test.equal(section.syntax_section.table_id_extension, 1, "table_id_extension");
    test.equal(section.syntax_section.version_number, 0, "version_number");
    test.equal(section.syntax_section.current_next_indicator, 1, "current_next_indicator");
    test.equal(section.syntax_section.section_number, 0, "section_number");
    test.equal(section.syntax_section.last_section_number, 0, "last_section_number");

    test.equal(section.transport_stream_id, 1);
    // TODO: test program_info
    test.done();
};

exports.TestPMT = function(test) {
    var data = new Uint8Array([2, 176, 61, 0, 2, 193, 0, 0, 224, 33, 240, 6, 5, 4, 67, 85, 69, 73, 2, 224, 33, 240, 0, 129, 224, 36, 240, 0, 134, 224, 45, 240, 0, 192, 230, 232, 240, 9, 5, 4, 69, 84, 86, 49, 162, 1, 0, 192, 230, 234, 240, 8, 5, 4, 69, 84, 86, 49, 161, 0, 112, 252, 191, 31]).buffer;
    var section = MpegTs.decodeSection(data);

    test.equal(section.table_id, 2, "table_id should be 0x02");
    test.equal(section.private_indicator, 0, "private_indicator");

    test.equal(section.syntax_section.table_id_extension, 2, "table_id_extension");
    test.equal(section.syntax_section.version_number, 0, "version_number");
    test.equal(section.syntax_section.current_next_indicator, 1, "current_next_indicator");
    test.equal(section.syntax_section.section_number, 0, "section_number");
    test.equal(section.syntax_section.last_section_number, 0, "last_section_number");

    test.equal(section.program_number, 2);
    test.equal(section.PCR_PID, 33);
    test.equal(section.program_info_length, 6);

    test.deepEqual(section.descriptors, [{
        tag: 5,
        data: new Uint8Array([67, 85, 69, 73]).buffer
    }]);

    test.deepEqual(section.streams, [{
        stream_type: 2,
        elementary_PID: 33,
        descriptors: []
    }, {
        stream_type: 129,
        elementary_PID: 36,
        descriptors: []
    }, {
        stream_type: 134,
        elementary_PID: 45,
        descriptors: []
    }, {
        stream_type: 192,
        elementary_PID: 1768,
        descriptors: [{
            tag: 5,
            data: new Uint8Array([69, 84, 86, 49]).buffer
        }, {
            tag: 162,
            data: new Uint8Array([0]).buffer
        }]
    }, {
        stream_type: 192,
        elementary_PID: 1770,
        descriptors: [{
            tag: 5,
            data: new Uint8Array([69, 84, 86, 49]).buffer
        }, {
            tag: 161,
            data: new Uint8Array([]).buffer
        }]
    }]);

    test.done();
};

exports.TestUserPrivateData = function(test) {
    var data = new Uint8Array([224, 0, 114, 0, 0, 0, 3, 0, 0, 8, 0, 255, 255, 255, 0, 1, 0, 224, 94, 1, 1, 0, 0, 0, 0, 0, 0, 0, 100, 16, 82, 0, 80, 108, 105, 100, 58, 47, 47, 105, 98, 46, 116, 118, 119, 111, 114, 107, 115, 46, 99, 111, 109, 47, 67, 97, 98, 108, 101, 108, 97, 98, 115, 95, 78, 97, 116, 105, 111, 110, 97, 108, 95, 101, 116, 118, 95, 115, 116, 114, 101, 97, 109, 95, 99, 111, 110, 102, 105, 103, 47, 109, 97, 105, 110, 97, 112, 112, 47, 49, 46, 48, 47, 109, 97, 105, 110, 95, 112, 114, 46, 112, 114, 90, 3, 153, 38]).buffer;
    var section = MpegTs.decodeSection(data);
    test.equal(section.table_id, 224, "table_id");
    test.equal(section.private_indicator, 0, "private_indicator");

    test.equal(section.syntax_section, null, "syntax_section");

    test.deepEqual(arrayBufferToArray(section.private_data), [0, 0, 0, 3, 0, 0, 8, 0, 255, 255, 255, 0, 1, 0, 224, 94, 1, 1, 0, 0, 0, 0, 0, 0, 0, 100, 16, 82, 0, 80, 108, 105, 100, 58, 47, 47, 105, 98, 46, 116, 118, 119, 111, 114, 107, 115, 46, 99, 111, 109, 47, 67, 97, 98, 108, 101, 108, 97, 98, 115, 95, 78, 97, 116, 105, 111, 110, 97, 108, 95, 101, 116, 118, 95, 115, 116, 114, 101, 97, 109, 95, 99, 111, 110, 102, 105, 103, 47, 109, 97, 105, 110, 97, 112, 112, 47, 49, 46, 48, 47, 109, 97, 105, 110, 95, 112, 114, 46, 112, 114, 90, 3, 153, 38]);
    test.done();
};
