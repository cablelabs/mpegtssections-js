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
  indent: 4, strict: true, shadow: true, camelcase: true, curly: true,
  quotmark: double, latedef: true, undef: true, unused: true, trailing: true */
"use strict";
var MpegTs = require("../lib/mpegtssections");

function arrayBufferToArray(buf) {
    var result = [];
    var asArray = new Uint8Array(buf);
    for (var i = 0; i < asArray.length; ++i) {
        result[i] = asArray[i];
    }
    return result;
}

function arrayToBufferWithValidCrc32(array) {
    array.push(0, 0, 0, 0);
    var buffer = new Uint8Array(array).buffer;
    var crc32 = MpegTs.calculateCrc32(buffer.slice(0, buffer.byteLength - 4));
    var view = new DataView(buffer);
    view.setUint32(buffer.byteLength - 4, crc32);
    return buffer;
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

exports.TestBufArgumentWrongType = function(test) {
    test.throws(function() {
        MpegTs.decodeSection([5]);
    }, TypeError);
    test.done();
};

exports.TestBufArgumentTooSmall = function(test) {
    test.throws(function() {
        var data = new Uint8Array([1, 2]).buffer;
        MpegTs.decodeSection(data);
    }, MpegTs.BadSizeError);
    test.done();
};

exports.TestBufLessThanSectionLength = function(test) {
    test.throws(function() {
        var data = new Uint8Array([0, 176, 13, 0, 1, 193, 0, 0, 0, 2, 224, 32, 160, 170, 220]).buffer;
        MpegTs.decodeSection(data);
    }, MpegTs.BadSizeError);
    test.done();
};

exports.TestBufGreaterThanSectionLength = function(test) {
    test.throws(function() {
        var data = new Uint8Array([0, 176, 13, 0, 1, 193, 0, 0, 0, 2, 224, 32, 160, 170, 220, 0, 0]).buffer;
        MpegTs.decodeSection(data);
    }, MpegTs.BadSizeError);
    test.done();
};

exports.TestBufferTooShortForSyntaxSection = function(test) {
    test.throws(function() {
        try {
            var data = new Uint8Array([0, 176, 0]).buffer;
            MpegTs.decodeSection(data);
        } catch (e) {
            test.equal(e.message, "section_syntax_indicator is 1, but the buffer is not long enough to contain a valid syntax section");
            throw e;
        }
    }, MpegTs.BadSizeError);
    test.done();
};

exports.TestBadCrc = function(test) {
    test.throws(function() {
        var data = new Uint8Array([0, 176, 13, 0, 5, 193, 0, 0, 0, 2, 224, 32, 160, 170, 220, 200]).buffer;
        MpegTs.decodeSection(data);
    }, MpegTs.InvalidCrcError);
    test.done();
};

exports.TestPat = function(test) {
    var data = new Uint8Array([0, 176, 13, 0, 1, 193, 0, 0, 0, 2, 224, 32, 160, 170, 220, 200]).buffer;
    var section = MpegTs.decodeSection(data);

    test.equal(section.tableId, 0, "tableId");

    test.equal(section.syntaxSection.tableIdExtension, 1, "tableIdExtension");
    test.equal(section.syntaxSection.versionNumber, 0, "versionNumber");
    test.equal(section.syntaxSection.currentNextIndicator, 1, "currentNextIndicator");
    test.equal(section.syntaxSection.sectionNumber, 0, "sectionNumber");
    test.equal(section.syntaxSection.lastSectionNumber, 0, "lastSectionNumber");

    test.equal(section.transportStreamId, 1, "transportStreamId");
    test.deepEqual(section.programInfo, [{
        programNumber: 2,
        pid: 2
    }], "programInfo");

    test.done();
};

exports.TestPmt = function(test) {
    var data = new Uint8Array([2, 176, 61, 0, 2, 193, 0, 0, 224, 33, 240, 6, 5, 4, 67, 85, 69, 73, 2, 224, 33, 240, 0, 129, 224, 36, 240, 0, 134, 224, 45, 240, 0, 192, 230, 232, 240, 9, 5, 4, 69, 84, 86, 49, 162, 1, 0, 192, 230, 234, 240, 8, 5, 4, 69, 84, 86, 49, 161, 0, 112, 252, 191, 31]).buffer;
    var section = MpegTs.decodeSection(data);

    test.equal(section.tableId, 2, "tableId");

    test.equal(section.syntaxSection.tableIdExtension, 2, "tableIdExtension");
    test.equal(section.syntaxSection.versionNumber, 0, "versionNumber");
    test.equal(section.syntaxSection.currentNextIndicator, 1, "currentNextIndicator");
    test.equal(section.syntaxSection.sectionNumber, 0, "sectionNumber");
    test.equal(section.syntaxSection.lastSectionNumber, 0, "lastSectionNumber");

    test.equal(section.programNumber, 2, "programNumber");
    test.equal(section.pcrPid, 33, "pcrPid");

    test.deepEqual(section.descriptors, [{
        tag: 5,
        data: new Uint8Array([67, 85, 69, 73]).buffer
    }], "descriptors");

    test.deepEqual(section.streams, [{
        streamType: 2,
        elementaryPid: 33,
        descriptors: []
    }, {
        streamType: 129,
        elementaryPid: 36,
        descriptors: []
    }, {
        streamType: 134,
        elementaryPid: 45,
        descriptors: []
    }, {
        streamType: 192,
        elementaryPid: 1768,
        descriptors: [{
            tag: 5,
            data: new Uint8Array([69, 84, 86, 49]).buffer
        }, {
            tag: 162,
            data: new Uint8Array([0]).buffer
        }]
    }, {
        streamType: 192,
        elementaryPid: 1770,
        descriptors: [{
            tag: 5,
            data: new Uint8Array([69, 84, 86, 49]).buffer
        }, {
            tag: 161,
            data: new Uint8Array([]).buffer
        }]
    }], "streams");

    test.done();
};

exports.TestPmtWithNullPcrPid = function(test) {
    var data = new Uint8Array(arrayToBufferWithValidCrc32([2, 176, 61, 0, 2, 193, 0, 0, 255, 255, 240, 6, 5, 4, 67, 85, 69, 73, 2, 224, 33, 240, 0, 129, 224, 36, 240, 0, 134, 224, 45, 240, 0, 192, 230, 232, 240, 9, 5, 4, 69, 84, 86, 49, 162, 1, 0, 192, 230, 234, 240, 8, 5, 4, 69, 84, 86, 49, 161, 0])).buffer;
    var section = MpegTs.decodeSection(data);
    test.strictEqual(section.pcrPid, null, "pcrPid");
    test.done();
};

exports.TestUserPrivateData = function(test) {
    var data = new Uint8Array([224, 0, 114, 0, 0, 0, 3, 0, 0, 8, 0, 255, 255, 255, 0, 1, 0, 224, 94, 1, 1, 0, 0, 0, 0, 0, 0, 0, 100, 16, 82, 0, 80, 108, 105, 100, 58, 47, 47, 105, 98, 46, 116, 118, 119, 111, 114, 107, 115, 46, 99, 111, 109, 47, 67, 97, 98, 108, 101, 108, 97, 98, 115, 95, 78, 97, 116, 105, 111, 110, 97, 108, 95, 101, 116, 118, 95, 115, 116, 114, 101, 97, 109, 95, 99, 111, 110, 102, 105, 103, 47, 109, 97, 105, 110, 97, 112, 112, 47, 49, 46, 48, 47, 109, 97, 105, 110, 95, 112, 114, 46, 112, 114, 90, 3, 153, 38]).buffer;
    var section = MpegTs.decodeSection(data);
    test.equal(section.tableId, 224, "tableId");
    test.equal(section.privateIndicator, 0, "privateIndicator");

    test.equal(section.syntaxSection, null, "syntaxSection");

    test.deepEqual(arrayBufferToArray(section.privateData), [0, 0, 0, 3, 0, 0, 8, 0, 255, 255, 255, 0, 1, 0, 224, 94, 1, 1, 0, 0, 0, 0, 0, 0, 0, 100, 16, 82, 0, 80, 108, 105, 100, 58, 47, 47, 105, 98, 46, 116, 118, 119, 111, 114, 107, 115, 46, 99, 111, 109, 47, 67, 97, 98, 108, 101, 108, 97, 98, 115, 95, 78, 97, 116, 105, 111, 110, 97, 108, 95, 101, 116, 118, 95, 115, 116, 114, 101, 97, 109, 95, 99, 111, 110, 102, 105, 103, 47, 109, 97, 105, 110, 97, 112, 112, 47, 49, 46, 48, 47, 109, 97, 105, 110, 95, 112, 114, 46, 112, 114, 90, 3, 153, 38], "privateData");
    test.done();
};
