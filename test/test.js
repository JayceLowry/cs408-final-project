import { truncateString } from '../js/utils.js';

QUnit.module("truncate", function() {
    const testString = "Imagine an imaginary menagerie manager managing an imaginary menagerie.";

    QUnit.test("Ensure string truncates", function(assert) {
        var result = truncateString(testString, 10);
        assert.equal(result.length, 10);
        assert.true(result.endsWith("..."));
    });

    QUnit.test("Ensure no truncation when truncation length > string length", function(assert) {
        var result = truncateString(testString, 80);
        assert.equal(result.length, 71);
        assert.false(result.endsWith("..."));
    });

    QUnit.test("Ensure no truncation when truncation length is negative", function(assert) {
        var result = truncateString(testString, -1);
        assert.equal(result.length, 71);
        assert.false(result.endsWith("..."));
    });
});
