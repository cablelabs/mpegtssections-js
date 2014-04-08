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

exports.TestUserPrivateData = function(test) {
    var data = new Uint8Array([227, 64, 136, 251, 251, 0, 59, 176, 126, 0, 1, 193, 0, 0, 17, 3, 16, 2, 128, 0, 0, 1, 255, 0, 0, 105, 0, 0, 0, 1, 3, 216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 12, 1, 60, 59, 67, 97, 98, 108, 101, 108, 97, 98, 115, 95, 78, 97, 116, 105, 111, 110, 97, 108, 95, 101, 116, 118, 95, 115, 116, 114, 101, 97, 109, 95, 99, 111, 110, 102, 105, 103, 47, 109, 97, 105, 110, 97, 112, 112, 47, 49, 46, 48, 47, 109, 97, 105, 110, 95, 112, 114, 46, 112, 114, 0, 15, 14, 105, 98, 46, 116, 118, 119, 111, 114, 107, 115, 46, 99, 111, 109, 225, 54, 136, 221, 188, 252, 142, 137]).buffer;
    var section = MpegTs.decodeSection(data);
    test.ok(section, "Section should not be null");
    test.done();
};
