import * as assert from "assert";

import * as qub from "../sources/Qub";

suite("Qub", () => {
    suite("quote(string)", () => {
        test("with null", () => {
            assert.deepEqual(qub.quote(null), "null");
        });

        test("with undefined", () => {
            assert.deepEqual(qub.quote(undefined), "undefined");
        });

        test(`with ""`, () => {
            assert.deepEqual(qub.quote(``), `""`);
        });

        test(`with "cats"`, () => {
            assert.deepEqual(qub.quote("cats"), `"cats"`);
        });
    });

    suite("escape(string)", () => {
        test("with null", () => {
            assert.deepEqual(qub.escape(null), null);
        });

        test("with undefined", () => {
            assert.deepEqual(qub.escape(undefined), undefined);
        });

        test(`with ""`, () => {
            assert.deepEqual(qub.escape(``), ``);
        });

        test(`with "cats"`, () => {
            assert.deepEqual(qub.escape("cats"), "cats");
        });

        test(`with "cat's"`, () => {
            assert.deepEqual(qub.escape("cat's"), "cat's");
        });

        test(`with "\\tcat's"`, () => {
            assert.deepEqual(qub.escape("\tcat's"), "\\tcat's");
        });

        test(`with "\\ncat's"`, () => {
            assert.deepEqual(qub.escape("\ncat's"), "\\ncat's");
        });

        test(`with "\\rcat's"`, () => {
            assert.deepEqual(qub.escape("\rcat's"), "\\rcat's");
        });
    });

    suite("toLowerCase()", () => {
        function toLowerCaseTest(original: string, expected: string = original): void {
            test(`with ${qub.escapeAndQuote(original)}`, () => {
                assert.deepEqual(qub.toLowerCase(original), expected);
            });
        }

        toLowerCaseTest(undefined);
        toLowerCaseTest(null);
        toLowerCaseTest("");
        toLowerCaseTest("[");
        toLowerCaseTest(" ");
        toLowerCaseTest("a");
        toLowerCaseTest("0");

        toLowerCaseTest("A", "a");
    });

    suite("startsWith()", () => {
        function startsWithTest(value: string, prefix: string, expected: boolean): void {
            test(`with ${qub.escapeAndQuote(value)} and ${qub.escapeAndQuote(prefix)}`, () => {
                assert.deepEqual(qub.startsWith(value, prefix), expected);
            });
        }

        startsWithTest(undefined, undefined, false);
        startsWithTest(undefined, null, false);
        startsWithTest(undefined, "", false);
        startsWithTest(undefined, " ", false);

        startsWithTest(null, undefined, false);
        startsWithTest(null, null, false);
        startsWithTest(null, "", false);
        startsWithTest(null, " ", false);

        startsWithTest("", undefined, false);
        startsWithTest("", null, false);
        startsWithTest("", "", false);
        startsWithTest("", " ", false);

        startsWithTest(" ", undefined, false);
        startsWithTest(" ", null, false);
        startsWithTest(" ", "", false);
        startsWithTest(" ", " ", true);

        startsWithTest("apples", undefined, false);
        startsWithTest("apples", null, false);
        startsWithTest("apples", "", false);
        startsWithTest("apples", " ", false);
        startsWithTest("apples", "app", true);
        startsWithTest("apples", "A", false);
    });

    suite("startsWithIgnoreCase()", () => {
        function startsWithIgnoreCaseTest(value: string, prefix: string, expected: boolean): void {
            test(`with ${qub.escapeAndQuote(value)} and ${qub.escapeAndQuote(prefix)}`, () => {
                assert.deepEqual(qub.startsWithIgnoreCase(value, prefix), expected);
            });
        }

        startsWithIgnoreCaseTest(undefined, undefined, false);
        startsWithIgnoreCaseTest(undefined, null, false);
        startsWithIgnoreCaseTest(undefined, "", false);
        startsWithIgnoreCaseTest(undefined, " ", false);

        startsWithIgnoreCaseTest(null, undefined, false);
        startsWithIgnoreCaseTest(null, null, false);
        startsWithIgnoreCaseTest(null, "", false);
        startsWithIgnoreCaseTest(null, " ", false);

        startsWithIgnoreCaseTest("", undefined, false);
        startsWithIgnoreCaseTest("", null, false);
        startsWithIgnoreCaseTest("", "", false);
        startsWithIgnoreCaseTest("", " ", false);

        startsWithIgnoreCaseTest(" ", undefined, false);
        startsWithIgnoreCaseTest(" ", null, false);
        startsWithIgnoreCaseTest(" ", "", false);
        startsWithIgnoreCaseTest(" ", " ", true);

        startsWithIgnoreCaseTest("apples", undefined, false);
        startsWithIgnoreCaseTest("apples", null, false);
        startsWithIgnoreCaseTest("apples", "", false);
        startsWithIgnoreCaseTest("apples", " ", false);
        startsWithIgnoreCaseTest("apples", "app", true);
        startsWithIgnoreCaseTest("apples", "A", true);
    });

    suite("isDefined(any)", () => {
        test("with null", () => {
            assert.deepEqual(qub.isDefined(null), false);
        });

        test("with undefined", () => {
            assert.deepEqual(qub.isDefined(undefined), false);
        });

        test(`with ""`, () => {
            assert.deepEqual(qub.isDefined(""), true);
        });

        test(`with 0`, () => {
            assert.deepEqual(qub.isDefined(0), true);
        });

        test(`with false`, () => {
            assert.deepEqual(qub.isDefined(false), true);
        });

        test(`with true`, () => {
            assert.deepEqual(qub.isDefined(true), true);
        });
    });

    suite("getLength(any[]|string)", () => {
        function getLengthTest(value: any[] | string, expectedLength: number): void {
            test(`with ${typeof value === "string" ? qub.quote(value) : JSON.stringify(value)}`, () => {
                assert.deepEqual(qub.getLength(value), expectedLength);
            });
        }

        getLengthTest(undefined, 0);
        getLengthTest(null, 0);
        getLengthTest("", 0);
        getLengthTest("hello", 5);
        getLengthTest([], 0);
        getLengthTest([50], 1);
        getLengthTest([50, 'test'], 2);
    });

    suite("getCombinedLength()", () => {
        test("with null", () => {
            assert.deepEqual(qub.getCombinedLength(null), 0);
        });

        test("with undefined", () => {
            assert.deepEqual(qub.getCombinedLength(undefined), 0);
        });

        test("with empty array", () => {
            assert.deepEqual(qub.getCombinedLength([]), 0);
        });

        test("with one value", () => {
            assert.deepEqual(qub.getCombinedLength(
                [
                    { getLength(): number { return 7; } }
                ]),
                7);
        });

        test("with multiple values", () => {
            assert.deepEqual(qub.getCombinedLength(
                [
                    { getLength(): number { return 2 } },
                    { getLength(): number { return 7 } }
                ]),
                9);
        });

        test("with non-contiguous multiple values", () => {
            assert.deepEqual(qub.getContiguousLength(
                [
                    {
                        startIndex: 5,
                        afterEndIndex: 10
                    },
                    {
                        startIndex: 13,
                        afterEndIndex: 20
                    }
                ]),
                15);
        });
    });

    suite("getContiguousLength()", () => {
        function getContiguousLengthTest(values: { startIndex: number, afterEndIndex: number }[] | qub.Iterable<{ startIndex: number, afterEndIndex: number }>, expectedLength: number = 0, valuesDescription: string = JSON.stringify(values)): void {
            test(`with ${valuesDescription}`, () => {
                assert.deepEqual(qub.getContiguousLength(values), expectedLength);
            });
        }

        getContiguousLengthTest(null);
        getContiguousLengthTest(undefined);
        getContiguousLengthTest([]);
        getContiguousLengthTest(new qub.ArrayList<{ startIndex: number, afterEndIndex: number }>());
        getContiguousLengthTest([{ startIndex: 5, afterEndIndex: 10 }], 5, "array with one value");
        getContiguousLengthTest(new qub.ArrayList([{ startIndex: 5, afterEndIndex: 10 }]), 5, "ArrayList with one value");
        getContiguousLengthTest(
            [
                { startIndex: 5, afterEndIndex: 10 },
                { startIndex: 10, afterEndIndex: 13 }
            ],
            8,
            "array with multiple values");
        getContiguousLengthTest(
            new qub.ArrayList([
                { startIndex: 5, afterEndIndex: 10 },
                { startIndex: 10, afterEndIndex: 13 }
            ]),
            8,
            "ArrayList with multiple values");
        getContiguousLengthTest(
            [
                { startIndex: 5, afterEndIndex: 10 },
                { startIndex: 13, afterEndIndex: 20 }
            ],
            15,
            "array with non-contiguous multiple values");
        getContiguousLengthTest(
            new qub.ArrayList([
                { startIndex: 5, afterEndIndex: 10 },
                { startIndex: 13, afterEndIndex: 20 }
            ]),
            15,
            "ArrayList with non-contiguous multiple values");
    });

    suite("getCombinedText()", () => {
        test("with null", () => {
            assert.deepEqual(qub.getCombinedText(null), "");
        });

        test("with undefined", () => {
            assert.deepEqual(qub.getCombinedText(undefined), "");
        });

        test("with empty array", () => {
            assert.deepEqual(qub.getCombinedText([]), "");
        });

        test("with one value", () => {
            assert.deepEqual(qub.getCombinedText(["hello"]), "hello");
        });

        test("with multiple values", () => {
            assert.deepEqual(qub.getCombinedText(["hello", 5, false]), "hello5false");
        });
    });

    suite("clone(any)", () => {
        function cloneTest(value: any): void {
            test(`with ${qub.quote(qub.escape(JSON.stringify(value)))}`, () => {
                // Equal contents
                assert.deepEqual(qub.clone(value), value);

                if (value instanceof Array || value instanceof Object) {
                    // Not same memory location
                    assert.notEqual(qub.clone(value), value);
                }
            });
        }

        cloneTest(null);
        cloneTest(undefined);
        cloneTest(true);
        cloneTest(false);
        cloneTest(0);
        cloneTest(5);
        cloneTest(-12);
        cloneTest("");
        cloneTest("hello");
        cloneTest({});
        cloneTest({ a: 0, b: "1" });
        cloneTest({ a: { b: "1" } });
        cloneTest([]);
        cloneTest([false, 0, ""]);
        cloneTest([[], []]);
    });

    suite("cloneArray(any[])", () => {
        function cloneArrayTest(value: any[]): void {
            test(`with ${JSON.stringify(value)}`, () => {
                // Equal contents
                assert.deepEqual(qub.cloneArray(value), value);

                if (value instanceof Array) {
                    // Not same memory location
                    assert.notEqual(qub.cloneArray(value), value);
                }
            });
        }

        cloneArrayTest(undefined);
        cloneArrayTest(null);
        cloneArrayTest([]);
        cloneArrayTest([false]);
        cloneArrayTest([[[[]]]]);
    });

    test("getPackageJson()", () => {
        const packageJson: any = qub.getPackageJson(__dirname);
        assert(packageJson);
        assert.deepStrictEqual(packageJson.name, "qub")
    });

    suite("endsWith()", () => {
        function endsWithTest(value: string, suffix: string, expected: boolean): void {
            test(`with ${qub.escapeAndQuote(value)} and ${qub.escapeAndQuote(suffix)}`, () => {
                assert.deepEqual(qub.endsWith(value, suffix), expected);
            });
        }

        endsWithTest(undefined, undefined, false);
        endsWithTest(undefined, null, false);
        endsWithTest(undefined, "", false);
        endsWithTest(undefined, "les", false);

        endsWithTest(null, undefined, false);
        endsWithTest(null, null, false);
        endsWithTest(null, "", false);
        endsWithTest(null, "les", false);

        endsWithTest("", undefined, false);
        endsWithTest("", null, false);
        endsWithTest("", "", false);
        endsWithTest("", "les", false);

        endsWithTest("bananas", undefined, false);
        endsWithTest("bananas", null, false);
        endsWithTest("bananas", "", false);
        endsWithTest("bananas", "les", false);

        endsWithTest("apples", undefined, false);
        endsWithTest("apples", null, false);
        endsWithTest("apples", "", false);
        endsWithTest("apples", "les", true);
        endsWithTest("les", "les", true);
        endsWithTest("es", "les", false);
    });

    suite("contains()", () => {
        function containsTest(value: string, searchString: string, expected: boolean): void {
            test(`with ${qub.escapeAndQuote(value)} and ${qub.escapeAndQuote(searchString)}`, () => {
                assert.deepEqual(qub.contains(value, searchString), expected);
            });
        }

        containsTest(undefined, undefined, false);
        containsTest(undefined, null, false);
        containsTest(undefined, "", false);
        containsTest(undefined, "les", false);

        containsTest(null, undefined, false);
        containsTest(null, null, false);
        containsTest(null, "", false);
        containsTest(null, "les", false);

        containsTest("", undefined, false);
        containsTest("", null, false);
        containsTest("", "", false);
        containsTest("", "les", false);

        containsTest("bananas", undefined, false);
        containsTest("bananas", null, false);
        containsTest("bananas", "", false);
        containsTest("bananas", "les", false);

        containsTest("apples", undefined, false);
        containsTest("apples", null, false);
        containsTest("apples", "", false);
        containsTest("apples", "les", true);
        containsTest("apples", "pl", true);
        containsTest("apples", "app", true);
        containsTest("les", "les", true);
        containsTest("es", "les", false);
    });

    test("repeat()", () => {
        assert.deepEqual(qub.repeat(undefined, undefined), "");
        assert.deepEqual(qub.repeat(undefined, null), "");
        assert.deepEqual(qub.repeat(undefined, 0), "");
        assert.deepEqual(qub.repeat(undefined, 5), "");
        assert.deepEqual(qub.repeat(null, undefined), "");
        assert.deepEqual(qub.repeat(null, null), "");
        assert.deepEqual(qub.repeat(null, 0), "");
        assert.deepEqual(qub.repeat(null, 4), "");
        assert.deepEqual(qub.repeat("", undefined), "");
        assert.deepEqual(qub.repeat("", null), "");
        assert.deepEqual(qub.repeat("", 0), "");
        assert.deepEqual(qub.repeat("", 2), "");
        assert.deepEqual(qub.repeat("a", undefined), "");
        assert.deepEqual(qub.repeat("a", null), "");
        assert.deepEqual(qub.repeat("a", 0), "");
        assert.deepEqual(qub.repeat("a", 1), "a");
        assert.deepEqual(qub.repeat("a", 3), "aaa");
        assert.deepEqual(qub.repeat("ab", undefined), "");
        assert.deepEqual(qub.repeat("ab", null), "");
        assert.deepEqual(qub.repeat("ab", 0), "");
        assert.deepEqual(qub.repeat("ab", 1), "ab");
        assert.deepEqual(qub.repeat("ab", 3), "ababab");
    });

    suite("getLineIndex()", () => {
        function getLineIndexTest(text: string, characterIndex: number, expectedLineIndex: number): void {
            test(`with ${qub.escapeAndQuote(text)} and characterIndex ${characterIndex}`, () => {
                assert.deepEqual(qub.getLineIndex(text, characterIndex), expectedLineIndex);
            });
        }

        getLineIndexTest(undefined, undefined, undefined);
        getLineIndexTest(undefined, null, undefined);
        getLineIndexTest(undefined, -1, undefined);
        getLineIndexTest(undefined, 0, undefined);
        getLineIndexTest(null, undefined, undefined);
        getLineIndexTest(null, null, undefined);
        getLineIndexTest(null, -1, undefined);
        getLineIndexTest(null, 0, undefined);
        getLineIndexTest("", undefined, undefined);
        getLineIndexTest("", null, undefined);
        getLineIndexTest("", -1, undefined);
        getLineIndexTest("", 0, 0);
        getLineIndexTest("", 5, 0);
        getLineIndexTest("abc", undefined, undefined);
        getLineIndexTest("abc", null, undefined);
        getLineIndexTest("abc", -1, undefined);
        getLineIndexTest("abc", 0, 0);
        getLineIndexTest("abc", 2, 0);
        getLineIndexTest("ab\nc", 0, 0);
        getLineIndexTest("ab\nc", 1, 0);
        getLineIndexTest("ab\nc", 2, 0);
        getLineIndexTest("ab\nc", 3, 1);
        getLineIndexTest("ab\nc", 4, 1);
        getLineIndexTest("ab\nc", 10, 1);
    });

    suite("getColumnIndex()", () => {
        function getColumnIndexTest(text: string, characterIndex: number, expectedLineIndex: number): void {
            test(`with ${qub.escapeAndQuote(text)} and characterIndex ${characterIndex}`, () => {
                assert.deepEqual(qub.getColumnIndex(text, characterIndex), expectedLineIndex);
            });
        }

        getColumnIndexTest(undefined, undefined, undefined);
        getColumnIndexTest(undefined, null, undefined);
        getColumnIndexTest(undefined, -1, undefined);
        getColumnIndexTest(undefined, 0, undefined);
        getColumnIndexTest(null, undefined, undefined);
        getColumnIndexTest(null, null, undefined);
        getColumnIndexTest(null, -1, undefined);
        getColumnIndexTest(null, 0, undefined);
        getColumnIndexTest("", undefined, undefined);
        getColumnIndexTest("", null, undefined);
        getColumnIndexTest("", -1, undefined);
        getColumnIndexTest("", 0, 0);
        getColumnIndexTest("", 5, 5);
        getColumnIndexTest("abc", undefined, undefined);
        getColumnIndexTest("abc", null, undefined);
        getColumnIndexTest("abc", -1, undefined);
        getColumnIndexTest("abc", 0, 0);
        getColumnIndexTest("abc", 2, 2);
        getColumnIndexTest("ab\nc", 0, 0);
        getColumnIndexTest("ab\nc", 1, 1);
        getColumnIndexTest("ab\nc", 2, 2);
        getColumnIndexTest("ab\nc", 3, 0);
        getColumnIndexTest("ab\nc", 4, 1);
        getColumnIndexTest("ab\nc", 10, 7);
    });

    suite("getLineIndent()", () => {
        function getLineIndentTest(text: string, characterIndex: number, expectedLineIndent: string): void {
            test(`with ${qub.escapeAndQuote(text)} and characterIndex ${characterIndex}`, () => {
                assert.deepEqual(qub.getLineIndent(text, characterIndex), expectedLineIndent);
            });
        }

        getLineIndentTest(undefined, undefined, undefined);
        getLineIndentTest(undefined, null, undefined);
        getLineIndentTest(undefined, -1, undefined);
        getLineIndentTest(undefined, 0, undefined);
        getLineIndentTest(null, undefined, undefined);
        getLineIndentTest(null, null, undefined);
        getLineIndentTest(null, -1, undefined);
        getLineIndentTest(null, 0, undefined);
        getLineIndentTest("", undefined, undefined);
        getLineIndentTest("", null, undefined);
        getLineIndentTest("", -1, undefined);
        getLineIndentTest("", 0, "");
        getLineIndentTest("", 5, "");
        getLineIndentTest("abc", undefined, undefined);
        getLineIndentTest("abc", null, undefined);
        getLineIndentTest("abc", -1, undefined);
        getLineIndentTest("abc", 0, "");
        getLineIndentTest("abc", 2, "");
        getLineIndentTest("ab\nc", 0, "");
        getLineIndentTest("ab\nc", 1, "");
        getLineIndentTest("ab\nc", 2, "");
        getLineIndentTest("ab\nc", 3, "");
        getLineIndentTest("ab\nc", 4, "");
        getLineIndentTest("ab\nc", 10, "");
        getLineIndentTest("a\n  b\n\tc", 0, "");
        getLineIndentTest("a\n  b\n\tc", 1, "");
        getLineIndentTest("a\n  b\n\tc", 2, "  ");
        getLineIndentTest("a\n  b\n\tc", 3, "  ");
        getLineIndentTest("a\n  b\n\tc", 4, "  ");
        getLineIndentTest("a\n  b\n\tc", 5, "  ");
        getLineIndentTest("a\n  b\n\tc", 6, "\t");
        getLineIndentTest("a\n  b\n\tc", 7, "\t");
        getLineIndentTest("a\n  b\n\tc", 8, "\t");
    });

    suite("getStartIndex()", () => {
        test("with undefined", () => {
            assert.deepEqual(qub.getStartIndex(undefined), undefined);
        });

        test("with null", () => {
            assert.deepEqual(qub.getStartIndex(null), undefined);
        });

        test("with empty array", () => {
            assert.deepEqual(qub.getStartIndex([]), undefined);
        });

        test("with single-valued array", () => {
            assert.deepEqual(qub.getStartIndex([{ startIndex: 20 }]), 20);
        });

        test("with multi-valued array", () => {
            assert.deepEqual(qub.getStartIndex([{ startIndex: 7 }, { startIndex: 20 }]), 7);
        });

        test("with empty Iterable", () => {
            const values = new qub.ArrayList<qub.HasStartIndex>();
            assert.deepEqual(qub.getStartIndex(values), undefined);
        });

        test("with single-valued Iterable", () => {
            const values = new qub.ArrayList<qub.HasStartIndex>([{ startIndex: 22 }]);
            assert.deepEqual(qub.getStartIndex(values), 22);
        });

        test("with multi-valued Iterable", () => {
            const values = new qub.ArrayList<qub.HasStartIndex>([{ startIndex: 3 }, { startIndex: 9 }]);
            assert.deepEqual(qub.getStartIndex(values), 3);
        });
    });

    suite("getAfterEndIndex()", () => {
        test("with undefined", () => {
            assert.deepEqual(qub.getAfterEndIndex(undefined), undefined);
        });

        test("with null", () => {
            assert.deepEqual(qub.getAfterEndIndex(null), undefined);
        });

        test("with empty array", () => {
            assert.deepEqual(qub.getAfterEndIndex([]), undefined);
        });

        test("with single-valued array", () => {
            assert.deepEqual(qub.getAfterEndIndex([{ afterEndIndex: 20 }]), 20);
        });

        test("with multi-valued array", () => {
            assert.deepEqual(qub.getAfterEndIndex([{ afterEndIndex: 7 }, { afterEndIndex: 29 }]), 29);
        });

        test("with empty Iterable", () => {
            const values = new qub.ArrayList<qub.HasAfterEndIndex>();
            assert.deepEqual(qub.getAfterEndIndex(values), undefined);
        });

        test("with single-valued Iterable", () => {
            const values = new qub.ArrayList<qub.HasAfterEndIndex>([{ afterEndIndex: 22 }]);
            assert.deepEqual(qub.getAfterEndIndex(values), 22);
        });

        test("with multi-valued Iterable", () => {
            const values = new qub.ArrayList<qub.HasAfterEndIndex>([{ afterEndIndex: 3 }, { afterEndIndex: 9 }]);
            assert.deepEqual(qub.getAfterEndIndex(values), 9);
        });
    });

    suite("getSpan()", () => {
        test("with undefined", () => {
            assert.deepEqual(qub.getSpan(undefined), undefined);
        });

        test("with null", () => {
            assert.deepEqual(qub.getSpan(null), undefined);
        });

        test("with empty array", () => {
            assert.deepEqual(qub.getSpan([]), undefined);
        });

        test("with single-valued array", () => {
            assert.deepEqual(qub.getSpan([{ startIndex: 5, afterEndIndex: 20 }]), new qub.Span(5, 15));
        });

        test("with multi-valued array", () => {
            assert.deepEqual(qub.getSpan([{ startIndex: 1, afterEndIndex: 7 }, { startIndex: 8, afterEndIndex: 29 }]), new qub.Span(1, 28));
        });

        test("with empty Iterable", () => {
            const values = new qub.ArrayList<qub.HasStartIndexAndAfterEndIndex>();
            assert.deepEqual(qub.getSpan(values), undefined);
        });

        test("with single-valued Iterable", () => {
            const values = new qub.ArrayList<qub.HasStartIndexAndAfterEndIndex>([{ startIndex: 20, afterEndIndex: 22 }]);
            assert.deepEqual(qub.getSpan(values), new qub.Span(20, 2));
        });

        test("with multi-valued Iterable", () => {
            const values = new qub.ArrayList<qub.HasStartIndexAndAfterEndIndex>([{ startIndex: 2, afterEndIndex: 3 }, { startIndex: 4, afterEndIndex: 9 }]);
            assert.deepEqual(qub.getSpan(values), new qub.Span(2, 7));
        });
    });

    suite("ArrayList", () => {
        suite("constructor", () => {
            function constructorTest(initialValues: string[], expectedCount: number): void {
                test(`with ${JSON.stringify(initialValues)} and ${expectedCount}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);
                    assert.deepEqual(al.getCount(), expectedCount);
                    for (let i = 0; i < expectedCount; ++i) {
                        assert.deepEqual(al.get(i), initialValues[i]);
                    }
                });
            }

            constructorTest(undefined, 0);
            constructorTest(null, 0);
            constructorTest([], 0);
            constructorTest(["a", "b", "c"], 3);
        });

        suite("iterate()", () => {
            function iterateTest(initialValues: string[]): void {
                test(`with ${JSON.stringify(initialValues)}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);

                    const i = al.iterate();
                    assert.deepEqual(i.hasStarted(), false);
                    assert.deepEqual(i.hasCurrent(), false);

                    const initialValuesCount: number = qub.getLength(initialValues);
                    assert.deepEqual(i.next(), initialValuesCount > 0);

                    if (initialValues) {
                        for (let index = 0; index < initialValuesCount; ++index) {
                            assert.deepEqual(i.hasStarted(), true);
                            assert.deepEqual(i.hasCurrent(), true);
                            assert.deepEqual(i.getCurrent(), initialValues[index]);
                            assert.deepEqual(i.next(), index < initialValuesCount - 1);
                        }
                    }

                    assert.deepEqual(i.hasStarted(), true);
                    assert.deepEqual(i.hasCurrent(), false);
                    assert.deepEqual(i.next(), false);
                });
            }

            iterateTest(undefined);
            iterateTest(null);
            iterateTest([]);
            iterateTest(["a"]);
            iterateTest(["a", "b"]);
        });

        suite("iterateReverse()", () => {
            function iterateReverseTest(initialValues: string[]): void {
                test(`with ${JSON.stringify(initialValues)}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);

                    const i = al.iterateReverse();
                    assert.deepEqual(i.hasStarted(), false, "Wrong hasStarted() after creation.");
                    assert.deepEqual(i.hasCurrent(), false, "Wrong hasCurrent() after creation.");

                    const initialValuesCount: number = qub.getLength(initialValues);
                    assert.deepEqual(i.next(), initialValuesCount > 0, "Wrong first next().");

                    if (initialValues) {
                        for (let index: number = initialValuesCount - 1; index >= 0; --index) {
                            assert.deepEqual(i.hasStarted(), true, `Wrong hasStarted() for index ${index}.`);
                            assert.deepEqual(i.hasCurrent(), true, `Wrong hasCurrent() for index ${index}.`);
                            assert.deepEqual(i.getCurrent(), initialValues[index]);
                            assert.deepEqual(i.next(), index > 0);
                        }
                    }

                    assert.deepEqual(i.hasStarted(), true);
                    assert.deepEqual(i.hasCurrent(), false);
                    assert.deepEqual(i.next(), false);
                });
            }

            iterateReverseTest(undefined);
            iterateReverseTest(null);
            iterateReverseTest([]);
            iterateReverseTest(["a"]);
            iterateReverseTest(["a", "b"]);
        });

        suite("first()", () => {
            function firstTest(initialValues?: number[]): void {
                test(`with ${JSON.stringify(initialValues)}`, () => {
                    const arrayList = initialValues ? new qub.ArrayList(initialValues) : new qub.ArrayList();
                    assert.deepEqual(arrayList.first(), initialValues && initialValues.length > 0 ? initialValues[0] : undefined);
                });
            }

            firstTest(undefined);
            firstTest([]);
            firstTest([30]);
            firstTest([31, 32]);
        });

        suite("last()", () => {
            function lastTest(initialValues?: number[]): void {
                test(`with ${JSON.stringify(initialValues)}`, () => {
                    const arrayList = initialValues ? new qub.ArrayList(initialValues) : new qub.ArrayList();
                    assert.deepEqual(arrayList.last(), initialValues && initialValues.length > 0 ? initialValues[initialValues.length - 1] : undefined);
                });
            }

            lastTest(undefined);
            lastTest([]);
            lastTest([30]);
            lastTest([31, 32]);
        });

        test("set()", () => {
            const arrayList = new qub.ArrayList([0, 1, 2, 3, 4, 5]);
            arrayList.set(-1, 50);
            assert.deepEqual(arrayList, new qub.ArrayList([0, 1, 2, 3, 4, 5]));

            arrayList.set(0, 17);
            assert.deepEqual(arrayList, new qub.ArrayList([17, 1, 2, 3, 4, 5]));

            arrayList.set(3, 999);
            assert.deepEqual(arrayList, new qub.ArrayList([17, 1, 2, 999, 4, 5]));

            arrayList.set(5, 1);
            assert.deepEqual(arrayList, new qub.ArrayList([17, 1, 2, 999, 4, 1]));

            arrayList.set(6, 0);
            assert.deepEqual(arrayList, new qub.ArrayList([17, 1, 2, 999, 4, 1]));

            arrayList.set(null, 10);
            assert.deepEqual(arrayList, new qub.ArrayList([17, 1, 2, 999, 4, 1]));

            arrayList.set(undefined, 2);
            assert.deepEqual(arrayList, new qub.ArrayList([17, 1, 2, 999, 4, 1]));

            arrayList.set(2, null);
            assert.deepEqual(arrayList, new qub.ArrayList([17, 1, null, 999, 4, 1]));

            arrayList.set(0, undefined);
            assert.deepEqual(arrayList, new qub.ArrayList([undefined, 1, null, 999, 4, 1]));
        });

        test("setLast()", () => {
            const al1 = new qub.ArrayList<string>();
            al1.setLast("hello!");
            assert.deepEqual(al1, new qub.ArrayList<string>());

            const al2 = new qub.ArrayList(["hello", "there"]);
            al2.setLast("Abe");
            assert.deepEqual(al2, new qub.ArrayList(["hello", "Abe"]));

            const al3 = new qub.ArrayList(["hello", "there"]);
            al3.setLast(null);
            assert.deepEqual(al3, new qub.ArrayList(["hello", null]));

            const al4 = new qub.ArrayList(["hello", "there"]);
            al4.setLast(undefined);
            assert.deepEqual(al4, new qub.ArrayList(["hello", undefined]));
        });

        suite("get()", () => {
            function getTest(values: string[]): void {
                const valuesLength: number = qub.getLength(values);

                for (let i = -1; i <= valuesLength + 1; ++i) {
                    test(`with ${JSON.stringify(values)} at index ${i}`, () => {
                        const al = new qub.ArrayList<string>(values);
                        assert.deepEqual(al.get(i), (0 <= i && i < valuesLength) ? values[i] : undefined);
                    });
                }
            }

            getTest(undefined);
            getTest(null);
            getTest([]);
            getTest(["a"]);
            getTest(["a", "b"]);
        });

        suite("getFromEnd()", () => {
            function getFromEndTest(values: string[]): void {
                const valuesLength: number = qub.getLength(values);

                for (let i = -1; i <= valuesLength + 1; ++i) {
                    test(`with ${JSON.stringify(values)} at index ${i}`, () => {
                        const al = new qub.ArrayList<string>(values);
                        assert.deepEqual(al.getFromEnd(i), (0 <= i && i < valuesLength) ? values[values.length - 1 - i] : undefined);
                    });
                }
            }

            getFromEndTest(undefined);
            getFromEndTest(null);
            getFromEndTest([]);
            getFromEndTest(["a"]);
            getFromEndTest(["a", "b"]);
        });

        suite("add()", () => {
            function addTest(initialValues: string[], valuesToAdd: string[]): void {
                test(`adding ${JSON.stringify(valuesToAdd)} to ${JSON.stringify(initialValues)}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);
                    const initialValuesLength: number = qub.getLength(initialValues);

                    for (const valueToAdd of valuesToAdd) {
                        al.add(valueToAdd);

                        for (let i = 0; i < al.getCount(); ++i) {
                            if (i < initialValuesLength) {
                                assert.deepEqual(al.get(i), initialValues[i]);
                            }
                            else {
                                assert.deepEqual(al.get(i), valuesToAdd[i - initialValuesLength]);
                            }
                        }
                    }
                });
            }

            addTest([], ["a"]);
            addTest([], ["a", "b"]);
            addTest([], ["a", "b", "c"]);
            addTest(["a"], ["b"]);
            addTest(["a"], ["b", "c"]);
            addTest(["a", "b"], ["c"]);

            test(`adding ["c", "d"] to ["a", "b"] after removing "a"`, () => {
                const al = new qub.ArrayList<string>(["a", "b"]);
                al.remove("a");

                al.add("c");
                al.add("d");

                assert.deepEqual(al.get(0), "b");
                assert.deepEqual(al.get(1), "c");
                assert.deepEqual(al.get(2), "d");
            });
        });

        suite("addAll()", () => {
            function addAllTest(initialValues: string[], valuesToAdd: string[]): void {
                test(`adding ${JSON.stringify(valuesToAdd)} to ${JSON.stringify(initialValues)}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);
                    const initialValuesLength: number = qub.getLength(initialValues);

                    al.addAll(valuesToAdd);
                    for (let i = 0; i < al.getCount(); ++i) {
                        if (i < initialValuesLength) {
                            assert.deepEqual(al.get(i), initialValues[i]);
                        }
                        else {
                            assert.deepEqual(al.get(i), valuesToAdd[i - initialValuesLength]);
                        }
                    }
                });
            }

            addAllTest([], ["a"]);
            addAllTest([], ["a", "b"]);
            addAllTest([], ["a", "b", "c"]);
            addAllTest(["a"], ["b"]);
            addAllTest(["a"], ["b", "c"]);
            addAllTest(["a", "b"], ["c"]);
        });

        suite("indexOf()", () => {
            function indexOfTest(initialValues: string[], valueToSearchFor: string, expectedIndex: number, comparer?: (lhs: string, rhs: string) => boolean): void {
                test(`with ${JSON.stringify(initialValues)}, search for ${qub.quote(valueToSearchFor)}${comparer ? " using custom comparer" : ""}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);
                    assert.deepEqual(al.indexOf(valueToSearchFor, comparer), expectedIndex);
                });
            }

            indexOfTest(undefined, undefined, undefined);
            indexOfTest(undefined, null, undefined);
            indexOfTest(undefined, "", undefined);
            indexOfTest(undefined, "a", undefined);

            indexOfTest(null, undefined, undefined);
            indexOfTest(null, null, undefined);
            indexOfTest(null, "", undefined);
            indexOfTest(null, "a", undefined);

            indexOfTest([], undefined, undefined);
            indexOfTest([], null, undefined);
            indexOfTest([], "", undefined);
            indexOfTest([], "a", undefined);

            indexOfTest(["a"], undefined, undefined);
            indexOfTest(["a"], null, undefined);
            indexOfTest(["a"], "", undefined);
            indexOfTest(["a"], "a", 0);

            indexOfTest(["a", null], undefined, undefined);
            indexOfTest(["a", null], null, 1);
            indexOfTest(["a", null], "", undefined);
            indexOfTest(["a", null], "a", 0);

            indexOfTest(["a", null, ""], undefined, undefined);
            indexOfTest(["a", null, ""], null, 1);
            indexOfTest(["a", null, ""], "", 2);
            indexOfTest(["a", null, ""], "a", 0);

            indexOfTest(["a"], "a", 0, (lhs: string, rhs: string) => { return lhs.toLowerCase() === rhs.toLowerCase(); });
            indexOfTest(["a"], "A", 0, (lhs: string, rhs: string) => { return lhs.toLowerCase() === rhs.toLowerCase(); });
            indexOfTest(["a"], "b", undefined, (lhs: string, rhs: string) => { return lhs.toLowerCase() === rhs.toLowerCase(); });
        });

        suite("contains()", () => {
            function containsTest(initialValues: string[], valueToSearchFor: string, expected: boolean): void {
                test(`with ${JSON.stringify(initialValues)}, search for ${qub.quote(valueToSearchFor)}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);
                    assert.deepEqual(al.contains(valueToSearchFor), expected);
                });
            }

            containsTest(undefined, undefined, false);
            containsTest(undefined, null, false);
            containsTest(undefined, "", false);
            containsTest(undefined, "a", false);

            containsTest(null, undefined, false);
            containsTest(null, null, false);
            containsTest(null, "", false);
            containsTest(null, "a", false);

            containsTest([], undefined, false);
            containsTest([], null, false);
            containsTest([], "", false);
            containsTest([], "a", false);

            containsTest(["a"], undefined, false);
            containsTest(["a"], null, false);
            containsTest(["a"], "", false);
            containsTest(["a"], "a", true);

            containsTest(["a", null], undefined, false);
            containsTest(["a", null], null, true);
            containsTest(["a", null], "", false);
            containsTest(["a", null], "a", true);

            containsTest(["a", null, ""], undefined, false);
            containsTest(["a", null, ""], null, true);
            containsTest(["a", null, ""], "", true);
            containsTest(["a", null, ""], "a", true);
        });

        suite("removeAt()", () => {
            function removeAtTest(initialValues: string[], removeIndex: number): void {
                test(`with ${JSON.stringify(initialValues)} and ${removeIndex}`, () => {
                    const al = new qub.ArrayList<string>(initialValues);
                    const initialValuesLength: number = qub.getLength(initialValues);

                    al.removeAt(removeIndex);

                    if (removeIndex < 0 || initialValuesLength <= removeIndex) {
                        for (let i = 0; i < initialValuesLength; ++i) {
                            assert.deepEqual(al.get(i), initialValues[i]);
                        }
                    }
                    else {
                        for (let i = 0; i < removeIndex; ++i) {
                            assert.deepEqual(al.get(i), initialValues[i]);
                        }

                        for (let i = removeIndex; i <= al.getCount(); ++i) {
                            assert.deepEqual(al.get(i), initialValues[i + 1]);
                        }
                    }
                });
            }

            for (let i = -1; i <= 1; ++i) {
                removeAtTest(undefined, i);
            }

            for (let i = -1; i <= 1; ++i) {
                removeAtTest(null, i);
            }

            for (let i = -1; i <= 1; ++i) {
                removeAtTest([], i);
            }

            for (let i = -1; i <= 2; ++i) {
                removeAtTest(["a"], i);
            }

            for (let i = -1; i <= 3; ++i) {
                removeAtTest(["a", "b"], i);
            }

            for (let i = -1; i <= 4; ++i) {
                removeAtTest(["a", "b", "c"], i);
            }
        });

        suite("remove()", () => {
            test(`removing "a" from []`, () => {
                const a = new qub.ArrayList<string>([]);
                a.remove("a");
                assert.deepEqual(a.getCount(), 0);
            });

            test(`removing "a" from ["a"]`, () => {
                const a = new qub.ArrayList(["a"]);
                a.remove("a");
                assert.deepEqual(a.getCount(), 0);
            });
        });

        test("removeFirst()", () => {
            const a = new qub.ArrayList<string>();
            assert.deepEqual(a.removeFirst(), undefined);

            a.addAll(["a", "b"]);
            assert.deepEqual(a.removeFirst(), "a");
            assert.deepEqual(a.removeFirst(), "b");
            assert.deepEqual(a.removeFirst(), undefined);
        });

        test("removeLast()", () => {
            const a = new qub.ArrayList<string>();
            assert.deepEqual(a.removeLast(), undefined);

            a.addAll(["a", "b"]);
            assert.deepEqual(a.removeLast(), "b");
            assert.deepEqual(a.removeLast(), "a");
            assert.deepEqual(a.removeLast(), undefined);
        });

        suite("clear()", () => {
            test("with no elements", () => {
                const list = new qub.ArrayList<number>();
                list.clear();
                assert.deepStrictEqual(list.getCount(), 0);
            });

            test("with one element", () => {
                const list = new qub.ArrayList<number>([30]);
                list.clear();
                assert.deepStrictEqual(list.getCount(), 0);
            });

            test("with several elements", () => {
                const list = new qub.ArrayList<number>([1, 2, 3, 4]);
                list.clear();
                assert.deepStrictEqual(list.getCount(), 0);
            });
        });
    });

    suite("SingleLinkNode<T>", () => {
        suite("constructor()", () => {
            test("with value and no next node", () => {
                const node = new qub.SingleLinkNode<number>(0);
                assert.deepEqual(node.value, 0);
                assert.deepEqual(node.next, undefined);
            });

            test("with value and undefined next node", () => {
                const node = new qub.SingleLinkNode<number>(1, undefined);
                assert.deepEqual(node.value, 1);
                assert.deepEqual(node.next, undefined);
            });

            test("with value and null next node", () => {
                const node = new qub.SingleLinkNode<number>(2, null);
                assert.deepEqual(node.value, 2);
                assert.deepEqual(node.next, null);
            });

            test("with value and next node", () => {
                const next = new qub.SingleLinkNode<number>(4);
                const node = new qub.SingleLinkNode<number>(3, next);
                assert.deepEqual(node.value, 3);
                assert.deepEqual(node.next, next);
            });
        });

        suite("iterate()", () => {
            test("with 0", () => {
                const node = new qub.SingleLinkNode<number>(0);
                assert.deepEqual(node.toArray(), [0]);
            });

            test("with 0 -> 1", () => {
                const node = new qub.SingleLinkNode<number>(0, new qub.SingleLinkNode<number>(1));
                assert.deepEqual(node.toArray(), [0, 1]);
            });

            test("with 0 -> 1 -> 2", () => {
                const node = new qub.SingleLinkNode<number>(0, new qub.SingleLinkNode<number>(1, new qub.SingleLinkNode<number>(2)));
                assert.deepEqual(node.toArray(), [0, 1, 2]);
            });
        });

        suite("set value()", () => {
            function setValueTest(value: string): void {
                test(`with ${qub.escapeAndQuote(value)}`, () => {
                    const node = new qub.SingleLinkNode<string>("test");
                    node.value = value;
                    assert.deepEqual(node.value, value);
                });
            }

            setValueTest(undefined);
            setValueTest(null);
            setValueTest("");
            setValueTest("apples");
        });

        suite("set next()", () => {
            function setNextTest(next: qub.SingleLinkNode<string>): void {
                test(`with ${qub.escapeAndQuote(JSON.stringify(next))}`, () => {
                    const node = new qub.SingleLinkNode<string>("test");
                    node.next = next;
                    assert.deepEqual(node.next, next);
                });
            }

            setNextTest(undefined);
            setNextTest(null);
            setNextTest(new qub.SingleLinkNode<string>("oops!"));
        });
    });

    suite("GenericIndexableReverseIterator<T>", () => {
        test("next()", () => {
            const list = new qub.SingleLinkList<number>([0, 1, 2, 3, 4]);
            const iterator: qub.Iterator<number> = list.iterateReverse();
            assert.deepEqual(iterator.hasStarted(), false);
            assert.deepEqual(iterator.hasCurrent(), false);
            assert.deepEqual(iterator.getCurrent(), undefined);

            assert.deepEqual(iterator.toArray(), [4, 3, 2, 1, 0]);
            assert.deepEqual(iterator.hasStarted(), true);
            assert.deepEqual(iterator.hasCurrent(), false);
            assert.deepEqual(iterator.getCurrent(), undefined);

            assert.deepEqual(iterator.next(), false);
            assert.deepEqual(iterator.hasStarted(), true);
            assert.deepEqual(iterator.hasCurrent(), false);
            assert.deepEqual(iterator.getCurrent(), undefined);
        });
    });

    suite("SingleLinkList<T>", () => {
        suite("constructor()", () => {
            test("with no data", () => {
                const list = new qub.SingleLinkList<number>();
                assert.deepEqual(list.getCount(), 0);
                assert.deepEqual(list.first(), undefined);
                assert.deepEqual(list.last(), undefined);
                assert.deepEqual(list.toArray(), []);
            });

            function constructorTest(values: number[]) {
                test(`with ${qub.escapeAndQuote(JSON.stringify(values))}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    const length: number = qub.getLength(values);
                    assert.deepEqual(list.getCount(), length);
                    assert.deepEqual(list.first(), length > 0 ? values[0] : undefined);
                    assert.deepEqual(list.last(), length > 0 ? values[length - 1] : undefined);
                    assert.deepEqual(list.toArray(), values ? values : []);
                });
            }

            constructorTest(undefined);
            constructorTest(null);
            constructorTest([]);
            constructorTest([0]);
            constructorTest([0, 1]);
        });

        suite("iterateReverse()", () => {
            function iterateReverseTest(values: number[], expectedValues: number[]): void {
                test(`with ${qub.escapeAndQuote(JSON.stringify(values))}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    assert.deepEqual(list.iterateReverse().toArray(), expectedValues);
                });
            }

            iterateReverseTest(undefined, []);
            iterateReverseTest(null, []);
            iterateReverseTest([], []);
            iterateReverseTest([17], [17]);
            iterateReverseTest([1, 2, 3], [3, 2, 1]);
        });

        suite("get()", () => {
            function getTest(values: number[]): void {
                const length: number = qub.getLength(values);
                for (let i = -1; i <= length + 1; ++i) {
                    test(`with ${qub.escapeAndQuote(JSON.stringify(values))} and ${i}`, () => {
                        const list = new qub.SingleLinkList<number>(values);
                        assert.deepEqual(list.get(i), 0 <= i && i < length ? values[i] : undefined);
                    });
                }
            }

            getTest(undefined);
            getTest(null);
            getTest([])
            getTest([1, 2, 3]);
        });

        suite("getFromEnd()", () => {
            function getTest(values: number[]): void {
                const length: number = qub.getLength(values);
                for (let i = -1; i <= length + 1; ++i) {
                    test(`with ${qub.escapeAndQuote(JSON.stringify(values))} and ${i}`, () => {
                        const list = new qub.SingleLinkList<number>(values);
                        assert.deepEqual(list.getFromEnd(i), 0 <= i && i < length ? values[(length - 1) - i] : undefined);
                    });
                }
            }

            getTest(undefined);
            getTest(null);
            getTest([])
            getTest([1, 2, 3]);
        });

        suite("set()", () => {
            function setTest(values: number[], index: number, value: number, expectedValues: number[]) {
                test(`with ${qub.escapeAndQuote(JSON.stringify(values))} and value ${value} at index ${index}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    list.set(index, value);
                    assert.deepEqual(list.toArray(), expectedValues);
                });
            }

            setTest(undefined, undefined, undefined, []);
            setTest(null, null, null, []);
            setTest([], 0, 0, []);
            setTest([1], 1, 1, [1]);

            setTest([1, 2, 3], -1, 4, [1, 2, 3]);
            setTest([1, 2, 3], 0, 4, [4, 2, 3]);
            setTest([1, 2, 3], 1, 5, [1, 5, 3]);
            setTest([1, 2, 3], 2, 6, [1, 2, 6]);
            setTest([1, 2, 3], 3, 7, [1, 2, 3]);
        });

        suite("setLast()", () => {
            function setLastTest(values: number[], value: number, expectedValues: number[]): void {
                test(`with ${qub.escapeAndQuote(JSON.stringify(values))} and value ${value}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    list.setLast(value);
                    assert.deepEqual(list.toArray(), expectedValues);
                });
            }

            setLastTest(undefined, undefined, []);
            setLastTest(null, null, []);
            setLastTest([], 0, []);
            setLastTest([1], 2, [2]);
            setLastTest([1, 2], 3, [1, 3]);
            setLastTest([1, 2, 3], 4, [1, 2, 4]);
        });

        suite("any()", () => {
            function anyTest(values: number[]): void {
                test(`with ${qub.escapeAndQuote(JSON.stringify(values))}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    assert.deepEqual(list.any(), qub.getLength(values) > 0);
                });
            }

            anyTest(undefined);
            anyTest(null);
            anyTest([]);
            anyTest([1]);
            anyTest([1, 2]);
        });

        suite("indexOf()", () => {
            test("with no values and no comparer", () => {
                const list = new qub.SingleLinkList<number>();
                assert.deepEqual(list.indexOf(7), undefined);
            });

            test("with values and no comparer, but no match", () => {
                const list = new qub.SingleLinkList<number>([1, 2, 3]);
                assert.deepEqual(list.indexOf(7), undefined);
            });

            test("with values, no comparer, and a match", () => {
                const list = new qub.SingleLinkList<number>([1, 2, 3]);
                assert.deepEqual(list.indexOf(3), 2);
            });

            test("with no values and a comparer, but no match", () => {
                const list = new qub.SingleLinkList<number>();
                assert.deepEqual(list.indexOf(7, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), undefined);
            });

            test("with values, a comparer, and a match", () => {
                const list = new qub.SingleLinkList<number>([1, 2, 3]);
                assert.deepEqual(list.indexOf(7, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), 0);
            });
        });

        suite("removeAt()", () => {
            function removeAtTest(values: number[], index: number, expectedValues: number[]): void {
                test(`with ${qub.escapeAndQuote(JSON.stringify(values))} and index ${index}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    list.removeAt(index);
                    assert.deepEqual(list.toArray(), expectedValues);
                });
            }

            removeAtTest([], -1, []);
            removeAtTest([], 0, []);
            removeAtTest([], 1, []);

            removeAtTest([1], -1, [1]);
            removeAtTest([1], 0, []);
            removeAtTest([1], 1, [1]);

            removeAtTest([1, 2], -1, [1, 2]);
            removeAtTest([1, 2], 0, [2]);
            removeAtTest([1, 2], 1, [1]);
            removeAtTest([1, 2], 2, [1, 2]);

            removeAtTest([1, 2, 3], -1, [1, 2, 3]);
            removeAtTest([1, 2, 3], 0, [2, 3]);
            removeAtTest([1, 2, 3], 1, [1, 3]);
            removeAtTest([1, 2, 3], 2, [1, 2]);
            removeAtTest([1, 2, 3], 3, [1, 2, 3]);
        });

        suite("remove()", () => {
            test("with no values and no comparer", () => {
                const list = new qub.SingleLinkList<number>();
                assert.deepEqual(list.remove(7), undefined);
                assert.deepEqual(list.toArray(), []);
            });

            test("with values and no comparer, but no match", () => {
                const list = new qub.SingleLinkList<number>([1, 2, 3]);
                assert.deepEqual(list.remove(7), undefined);
                assert.deepEqual(list.toArray(), [1, 2, 3]);
            });

            test("with values, no comparer, and a match", () => {
                const list = new qub.SingleLinkList<number>([1, 2, 3]);
                assert.deepEqual(list.remove(3), 3);
                assert.deepEqual(list.toArray(), [1, 2]);
            });

            test("with no values and a comparer, but no match", () => {
                const list = new qub.SingleLinkList<number>();
                assert.deepEqual(list.remove(7, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), undefined);
                assert.deepEqual(list.toArray(), []);
            });

            test("with values, a comparer, and a match", () => {
                const list = new qub.SingleLinkList<number>([1, 2, 3]);
                assert.deepEqual(list.remove(7, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), 1);
                assert.deepEqual(list.toArray(), [2, 3]);
            });
        });

        suite("removeFirst()", () => {
            function removeFirstTest(values: number[], expectedRemovedValue: number, expectedValuesAfterRemove: number[]): void {
                test(`with ${JSON.stringify(values)}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    assert.deepEqual(list.removeFirst(), expectedRemovedValue);
                    assert.deepEqual(list.toArray(), expectedValuesAfterRemove);
                });
            }

            removeFirstTest(undefined, undefined, []);
            removeFirstTest(null, undefined, []);
            removeFirstTest([], undefined, []);
            removeFirstTest([1], 1, []);
            removeFirstTest([2, 3], 2, [3]);
            removeFirstTest([4, 5, 6], 4, [5, 6]);
        });

        suite("removeLast()", () => {
            function removeLastTest(values: number[], expectedRemovedValue: number, expectedValuesAfterRemove: number[]): void {
                test(`with ${JSON.stringify(values)}`, () => {
                    const list = new qub.SingleLinkList<number>(values);
                    assert.deepEqual(list.removeLast(), expectedRemovedValue);
                    assert.deepEqual(list.toArray(), expectedValuesAfterRemove);
                });
            }

            removeLastTest(undefined, undefined, []);
            removeLastTest(null, undefined, []);
            removeLastTest([], undefined, []);
            removeLastTest([1], 1, []);
            removeLastTest([2, 3], 3, [2]);
            removeLastTest([4, 5, 6], 6, [4, 5]);
        });

        suite("clear()", () => {
            test("with no elements", () => {
                const list = new qub.SingleLinkList<number>();
                list.clear();
                assert.deepStrictEqual(list.getCount(), 0);
            });

            test("with one element", () => {
                const list = new qub.SingleLinkList<number>([30]);
                list.clear();
                assert.deepStrictEqual(list.getCount(), 0);
            });

            test("with several elements", () => {
                const list = new qub.SingleLinkList<number>([1, 2, 3, 4]);
                list.clear();
                assert.deepStrictEqual(list.getCount(), 0);
            });
        });
    });

    suite("DoubleLinkNode<T>", () => {
        suite("constructor()", () => {
            test("with value, no next node, and no previous node", () => {
                const node = new qub.DoubleLinkNode<number>(0);
                assert.deepEqual(node.value, 0);
                assert.deepEqual(node.next, undefined);
                assert.deepEqual(node.previous, undefined);
            });

            test("with value, undefined next node, and no previous node", () => {
                const node = new qub.DoubleLinkNode<number>(1, undefined);
                assert.deepEqual(node.value, 1);
                assert.deepEqual(node.next, undefined);
                assert.deepEqual(node.previous, undefined);
            });

            test("with value, null next node, and no previous node", () => {
                const node = new qub.DoubleLinkNode<number>(2, null);
                assert.deepEqual(node.value, 2);
                assert.deepEqual(node.next, null);
                assert.deepEqual(node.previous, undefined);
            });

            test("with value, next node, and no previous node", () => {
                const next = new qub.DoubleLinkNode<number>(4);
                const node = new qub.DoubleLinkNode<number>(3, next);
                assert.deepEqual(node.value, 3);
                assert.deepEqual(node.next, next);
                assert.deepEqual(node.previous, undefined);
            });

            test("with value, undefined next node, and previous node", () => {
                const previous = new qub.DoubleLinkNode<number>(4);
                const node = new qub.DoubleLinkNode<number>(3, undefined, previous);
                assert.deepEqual(node.value, 3);
                assert.deepEqual(node.next, undefined);
                assert.deepEqual(node.previous, previous);
            });
        });

        suite("set value()", () => {
            function setValueTest(value: string): void {
                test(`with ${qub.escapeAndQuote(value)}`, () => {
                    const node = new qub.DoubleLinkNode<string>("test");
                    node.value = value;
                    assert.deepEqual(node.value, value);
                });
            }

            setValueTest(undefined);
            setValueTest(null);
            setValueTest("");
            setValueTest("apples");
        });

        suite("set next()", () => {
            function setNextTest(next: qub.DoubleLinkNode<string>): void {
                test(`with ${qub.escapeAndQuote(JSON.stringify(next))}`, () => {
                    const node = new qub.DoubleLinkNode<string>("test");
                    node.next = next;
                    assert.deepEqual(node.next, next);
                });
            }

            setNextTest(undefined);
            setNextTest(null);
            setNextTest(new qub.DoubleLinkNode<string>("oops!"));
        });

        suite("set previous()", () => {
            function setPreviousTest(previous: qub.DoubleLinkNode<string>): void {
                test(`with ${qub.escapeAndQuote(JSON.stringify(previous))}`, () => {
                    const node = new qub.DoubleLinkNode<string>("test");
                    node.previous = previous;
                    assert.deepEqual(node.previous, previous);
                });
            }

            setPreviousTest(undefined);
            setPreviousTest(null);
            setPreviousTest(new qub.DoubleLinkNode<string>("oops!"));
        });
    });

    suite("Stack", () => {
        test("constructor()", () => {
            const s = new qub.Stack<string>();
            assert.deepEqual(s.getCount(), 0);
            assert.deepEqual(s.any(), false);
            assert.deepEqual(s.peek(), undefined);
        });

        test("push()", () => {
            const s = new qub.Stack<number>();
            s.push(10);
            assert.deepEqual(s.getCount(), 1);
            assert.deepEqual(s.peek(), 10);

            s.push(20);
            assert.deepEqual(s.getCount(), 2);
            assert.deepEqual(s.peek(), 20);
        });

        test("pop()", () => {
            const s = new qub.Stack<number>();
            assert.deepEqual(s.pop(), undefined);
            assert.deepEqual(s.getCount(), 0);

            s.push(50);
            s.push(60);
            assert.deepEqual(s.getCount(), 2);
            assert.deepEqual(s.peek(), 60);
            assert.deepEqual(s.pop(), 60);
            assert.deepEqual(s.getCount(), 1);
            assert.deepEqual(s.pop(), 50);
            assert.deepEqual(s.getCount(), 0);
            assert.deepEqual(s.pop(), undefined);
            assert.deepEqual(s.getCount(), 0);
        });

        test("contains()", () => {
            const s = new qub.Stack<number>();
            assert.deepEqual(s.contains(0), false);

            s.push(20);
            s.push(16);
            assert.deepEqual(s.contains(17), false);
            assert.deepEqual(s.contains(16), true);
            assert.deepEqual(s.contains(20), true);

            assert.deepEqual(s.contains(5, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), false);
            assert.deepEqual(s.contains(4, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), true);
        });
    });

    suite("Queue<T>", () => {
        test("constructor()", () => {
            const q = new qub.Queue<number>();
            assert.deepEqual(q.getCount(), 0);
            assert.deepEqual(q.any(), false);
            assert.deepEqual(q.dequeue(), undefined);
        });

        test("enqueue()", () => {
            const q = new qub.Queue<number>();
            assert.deepEqual(q.contains(0), false);

            q.enqueue(20);
            q.enqueue(16);
            assert.deepEqual(q.contains(17), false);
            assert.deepEqual(q.contains(16), true);
            assert.deepEqual(q.contains(20), true);

            assert.deepEqual(q.contains(5, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), false);
            assert.deepEqual(q.contains(4, (lhs: number, rhs: number) => lhs % 2 === rhs % 2), true);
        });

        test("dequeue()", () => {
            const q = new qub.Queue<number>();
            assert.deepEqual(q.dequeue(), undefined);

            q.enqueue(0);
            q.enqueue(1);
            q.enqueue(2);

            assert.deepEqual(q.getCount(), 3);
            assert.deepEqual(q.any(), true);
            assert.deepEqual(q.dequeue(), 0);
            assert.deepEqual(q.dequeue(), 1);
            assert.deepEqual(q.dequeue(), 2);
            assert.deepEqual(q.dequeue(), undefined);
        });
    });

    suite("Iterator<T>", () => {
        suite("any()", () => {
            function anyTest(testName: string, originalValues: number[], condition: (value: number) => boolean, expected: boolean): void {
                test(testName, () => {
                    const iterable = new qub.ArrayList(originalValues);
                    assert.deepEqual(iterable.iterate().any(condition), expected);

                    const iterator: qub.Iterator<number> = iterable.iterate();
                    iterator.next();
                    assert.deepEqual(iterator.any(condition), expected);
                });
            }

            anyTest("empty iterator with undefined condition", [], undefined, false);
            anyTest("empty iterator with condition", [], (value: number) => value % 2 == 0, false);
            anyTest("non-empty iterator with undefined condition", [1, 3, 5], undefined, true);
            anyTest("non-empty iterator with condition with no matches", [1, 3, 5], (value: number) => value % 2 == 0, false);
            anyTest("non-empty iterator with condition with matches", [1, 3, 5, 4], (value: number) => value % 2 == 0, true);
        });

        suite("first()", () => {
            function firstTest(testName: string, originalValues: number[], condition: (value: number) => boolean, expected: number): void {
                test(testName, () => {
                    const iterable = new qub.ArrayList(originalValues);
                    assert.deepEqual(iterable.iterate().first(condition), expected);

                    const iterator: qub.Iterator<number> = iterable.iterate();
                    iterator.next();
                    assert.deepEqual(iterator.first(condition), expected);
                });
            }

            firstTest("empty iterator with undefined condition", [], undefined, undefined);
            firstTest("empty iterator with condition", [], (value: number) => value % 2 == 0, undefined);
            firstTest("non-empty iterator with undefined condition", [1, 3, 5], undefined, 1);
            firstTest("non-empty iterator with condition with no matches", [1, 3, 5], (value: number) => value % 2 == 0, undefined);
            firstTest("non-empty iterator with condition with matches", [1, 3, 5, 4], (value: number) => value % 2 == 0, 4);
        });

        suite("last()", () => {
            function lastTest(testName: string, originalValues: number[], condition: (value: number) => boolean, expected: number): void {
                test(testName, () => {
                    const iterable = new qub.ArrayList(originalValues);
                    assert.deepEqual(iterable.iterate().last(condition), expected);

                    const iterator: qub.Iterator<number> = iterable.iterate();
                    iterator.next();
                    assert.deepEqual(iterator.last(condition), expected);
                });
            }

            lastTest("empty iterator with undefined condition", [], undefined, undefined);
            lastTest("empty iterator with condition", [], (value: number) => value % 2 == 0, undefined);
            lastTest("non-empty iterator with undefined condition", [1, 3, 5], undefined, 5);
            lastTest("non-empty iterator with condition with no matches", [1, 3, 5], (value: number) => value % 2 == 0, undefined);
            lastTest("non-empty iterator with condition with matches", [1, 3, 5, 4], (value: number) => value % 2 == 0, 4);
        });

        suite("getCount()", () => {
            function getCountTest(values: string[]): void {
                const valuesLength: number = qub.getLength(values);

                const arrayList = values ? new qub.ArrayList<string>(values) : new qub.ArrayList<string>();
                const i1: qub.Iterator<string> = arrayList.iterate();
                assert.deepEqual(valuesLength, i1.getCount());

                const i2: qub.Iterator<string> = arrayList.iterate();
                i2.next();
                assert.deepEqual(valuesLength, i2.getCount());

                const i3: qub.Iterator<string> = arrayList.iterate();
                for (let i = 0; i < 2; ++i) {
                    i3.next();
                }
                assert.deepEqual(valuesLength > 0 ? valuesLength - 1 : valuesLength, i3.getCount());
            }

            getCountTest(undefined);
            getCountTest([]);
            getCountTest(["a"]);
            getCountTest(["a", "b"]);
        });

        suite("where()", () => {
            function whereTest(testName: string, originalValues: number[], condition: (value: number) => boolean, expectedValues: number[]): void {
                test(testName, () => {
                    const wi1: qub.Iterator<number> = new qub.ArrayList(originalValues).iterate().where(condition);
                    assert.deepEqual(wi1.hasStarted(), false, "Wrong hasStarted().");
                    assert.deepEqual(wi1.toArray(), expectedValues);

                    const i2: qub.Iterator<number> = new qub.ArrayList(originalValues).iterate();
                    i2.next();
                    const wi2: qub.Iterator<number> = i2.where(condition);
                    assert.deepEqual(wi2.hasStarted(), true, "Wrong hasStarted() with started iterator.");
                    assert.deepEqual(wi2.toArray(), expectedValues, "Wrong toArray() with started iterator.");
                });
            }

            whereTest("with undefined condition", [0, 1, 2], undefined, [0, 1, 2]);
            whereTest("return odd numbers", [0, 1, 2, 3, 4, 5], (value: number) => value % 2 === 1, [1, 3, 5]);
            whereTest("return numbers greater than 2", [0, 1, 2, 3, 4, 5], (value: number) => value > 2, [3, 4, 5]);
        });

        suite("skip()", () => {
            function skipTest(testName: string, originalValues: number[], toSkip: number, expectedValues: number[]): void {
                test(testName, () => {
                    const iterable = new qub.ArrayList(originalValues);

                    const si1: qub.Iterator<number> = iterable.iterate().skip(toSkip);
                    assert.deepEqual(si1.hasStarted(), false, "Wrong hasStarted() with non-started skip iterator.");
                    assert.deepEqual(si1.hasCurrent(), false, "Wrong hasCurrent() with non-started skip iterator.");
                    assert.deepEqual(si1.getCurrent(), undefined, "Wrong getCurrent() with non-started skip iterator.");
                    assert.deepEqual(si1.toArray(), expectedValues, "Wrong toArray() with unstarted skip iterator.");

                    const i2: qub.Iterator<number> = iterable.iterate();
                    i2.next();
                    const si2: qub.Iterator<number> = i2.skip(toSkip);
                    assert.deepEqual(si2.hasStarted(), true, "Wrong hasStarted() with started skip iterator.");
                    assert.deepEqual(si2.hasCurrent(), !qub.isDefined(toSkip) || toSkip < originalValues.length, "Wrong hasCurrent() with started skip iterator.");
                    assert.deepEqual(si2.toArray(), expectedValues);

                    const i3: qub.Iterator<number> = iterable.iterate();
                    i3.next();
                    const si3: qub.Iterator<number> = i3.skip(toSkip);
                    assert.deepEqual(si3.getCurrent(), !qub.isDefined(toSkip) || toSkip < originalValues.length ? originalValues[toSkip || 0] : undefined, "Wrong getCurrent() with started skip iterator.");
                });
            }

            skipTest("with undefined toSkip", [0, 1, 2, 3, 4], undefined, [0, 1, 2, 3, 4]);
            skipTest("with 0 toSkip", [0, 1, 2, 3, 4], 0, [0, 1, 2, 3, 4]);
            skipTest("with 1 toSkip", [0, 1, 2, 3, 4], 1, [1, 2, 3, 4]);
            skipTest("with 4 toSkip", [0, 1, 2, 3, 4], 4, [4]);
            skipTest("with 5 toSkip", [0, 1, 2, 3, 4], 5, []);
            skipTest("with 200", [0, 1, 2, 3, 4], 200, []);
        });

        suite("take()", () => {
            function takeTest(testName: string, originalValues: number[], toTake: number, expectedValues: number[]): void {
                test(testName, () => {
                    const iterable = new qub.ArrayList(originalValues);

                    const ti1: qub.Iterator<number> = iterable.iterate().take(toTake);
                    assert.deepEqual(ti1.hasStarted(), false, "Wrong hasStarted() with non-started take iterator.");
                    assert.deepEqual(ti1.hasCurrent(), false, "Wrong hasCurrent() with non-started take iterator.");
                    assert.deepEqual(ti1.getCurrent(), undefined, "Wrong getCurrent() with non-started take iterator.");
                    assert.deepEqual(ti1.toArray(), expectedValues, "Wrong toArray() with non-started take iterator.");

                    const i2: qub.Iterator<number> = iterable.iterate();
                    i2.next();
                    const ti2: qub.Iterator<number> = i2.take(toTake);
                    assert.deepEqual(ti2.hasStarted(), true, "Wrong hasStarted() with started take iterator.");
                    assert.deepEqual(ti2.hasCurrent(), qub.isDefined(toTake) && 1 <= toTake, "Wrong hasCurrent() with started take iterator.");
                    assert.deepEqual(ti2.toArray(), expectedValues, "Wrong toArray() with started take iterator.");
                });
            }

            takeTest("with undefined toTake", [0, 1, 2, 3, 4], undefined, []);
            takeTest("with 0 toTake", [0, 1, 2, 3, 4], 0, []);
            takeTest("with 1 toTake", [0, 1, 2, 3, 4], 1, [0]);
            takeTest("with 4 toTake", [0, 1, 2, 3, 4], 4, [0, 1, 2, 3]);
            takeTest("with 10 toTake", [0, 1, 2, 3, 4], 10, [0, 1, 2, 3, 4]);
        });

        suite("map()", () => {
            function mapTest(testName: string, originalValues: number[], mapFunction: (value: number) => string, expectedValues: string[]): void {
                test(testName, () => {
                    const iterable = new qub.ArrayList(originalValues);

                    const mi1: qub.Iterator<string> = iterable.iterate().map(mapFunction);
                    assert.deepEqual(mi1.hasStarted(), false, "Wrong hasStarted() with non-started map iterator.");
                    assert.deepEqual(mi1.hasCurrent(), false, "Wrong hasCurrent() with non-started map iterator.");
                    assert.deepEqual(mi1.getCurrent(), undefined, "Wrong getCurrent() with non-started map iterator.");
                    assert.deepEqual(mi1.toArray(), expectedValues, "Wrong toArray() with non-started map iterator.");

                    const i2: qub.Iterator<number> = iterable.iterate();
                    i2.next();
                    const mi2: qub.Iterator<string> = i2.map(mapFunction);
                    assert.deepEqual(mi2.hasStarted(), true, "Wrong hasStarted() with started map iterator.");
                    assert.deepEqual(mi2.hasCurrent(), qub.isDefined(mapFunction), "Wrong hasCurrent() with started map iterator.");
                    assert.deepEqual(mi2.getCurrent(), expectedValues[0], "Wrong getCurrent() with started map iterator.");
                    assert.deepEqual(mi2.toArray(), expectedValues, "Wrong toArray() with started map iterator.");

                    const mi3: qub.Iterator<string> = iterable.iterate().map(mapFunction);
                    assert.deepEqual(mi3.next(), qub.isDefined(mapFunction), "Wrong next() with non-started map iterator.");

                    const mi4: qub.Iterator<string> = iterable.iterate().map(mapFunction);
                    assert.deepEqual(mi4.getCount(), expectedValues.length, "Wrong getCount() with non-started map iterator.");

                    const mi5: qub.Iterator<string> = iterable.iterate().map(mapFunction);
                    assert.deepEqual(mi5.toArrayList(), new qub.ArrayList(expectedValues));

                    const mi6: qub.Iterator<string> = iterable.iterate().map(mapFunction);
                    assert.deepEqual(mi6.takeCurrent(), undefined);
                    assert.deepEqual(mi6.takeCurrent(), qub.getLength(expectedValues) >= 1 ? expectedValues[0] : undefined);
                    assert.deepEqual(mi6.takeCurrent(), qub.getLength(expectedValues) >= 2 ? expectedValues[1] : undefined);
                });
            }

            mapTest("with undefined mapFunction", [0, 1, 2, 3, 4], undefined, []);
            mapTest("with toString() mapFunction", [0, 1, 2, 3, 4], (value: number) => value.toString(), ["0", "1", "2", "3", "4"]);
            mapTest("with *2 and toString() mapFunction", [0, 1, 2, 3, 4], (value: number) => (value * 2).toString(), ["0", "2", "4", "6", "8"]);

            const iterable = new qub.ArrayList([0, 1, 2, 3]);
            suite("any()", () => {
                test("with no condition", () => {
                    assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).any(), true);
                });

                test("with matching condition", () => {
                    assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).any((value: string) => value === "2"), true);
                });

                test("with non-matching condition", () => {
                    assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).any((value: string) => value === "-2"), false);
                });
            });

            suite("first()", () => {
                test("with no condition", () => {
                    assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).first(), "0");
                });

                test("with condition", () => {
                    assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).first((value: string) => value === "2"), "2");
                });
            });

            test("where()", () => {
                assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).where((value: string) => value === "2").toArray(), ["2"]);
            });

            test("skip()", () => {
                assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).skip(2).toArray(), ["2", "3"]);
            });

            test("take()", () => {
                assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).take(3).toArray(), ["0", "1", "2"]);
            });

            test("map()", () => {
                assert.deepEqual(iterable.iterate().map((value: number) => value.toString()).map((value: string) => value + value).toArray(), ["00", "11", "22", "33"]);
            });
        });

        suite("concatenate()", () => {
            function concatenateTest(testName: string, originalValues: number[], toAdd: number[], expectedValues: number[]): void {
                test(testName, () => {
                    const iterable = new qub.ArrayList(originalValues);

                    const ci1: qub.Iterator<number> = iterable.iterate().concatenate(toAdd);
                    assert.deepEqual(ci1.hasStarted(), false, "Wrong hasStarted() with non-started skip iterator.");
                    assert.deepEqual(ci1.hasCurrent(), false, "Wrong hasCurrent() with non-started skip iterator.");
                    assert.deepEqual(ci1.getCurrent(), undefined, "Wrong getCurrent() with non-started skip iterator.");
                    assert.deepEqual(ci1.toArray(), expectedValues, "Wrong toArray() with unstarted skip iterator.");

                    const i2: qub.Iterator<number> = iterable.iterate();
                    i2.next();
                    const ci2: qub.Iterator<number> = i2.concatenate(toAdd);
                    assert.deepEqual(ci2.hasStarted(), true, "Wrong hasStarted() with started concatenate iterator.");
                    assert.deepEqual(ci2.hasCurrent(), qub.getLength(originalValues) >= 1 || qub.getLength(toAdd) >= 1, "Wrong hasCurrent() with started concatenate iterator.");
                    assert.deepEqual(ci2.toArray(), expectedValues);

                    const ci3: qub.Iterator<number> = iterable.iterate().concatenate(toAdd);
                    ci3.next();
                    assert.deepEqual(ci3.getCurrent(), qub.getLength(originalValues) >= 1 ? originalValues[0] : qub.getLength(toAdd) >= 1 ? toAdd[0] : undefined, "Wrong getCurrent() with started skip iterator.");
                });
            }

            concatenateTest("with undefined toAdd", [0, 1, 2, 3, 4], undefined, [0, 1, 2, 3, 4]);
            concatenateTest("with null toAdd", [0, 1, 2, 3, 4], null, [0, 1, 2, 3, 4]);
            concatenateTest("with [] toAdd", [0, 1, 2, 3, 4], [], [0, 1, 2, 3, 4]);
            concatenateTest("with [0] toAdd", [0, 1, 2, 3, 4], [0], [0, 1, 2, 3, 4, 0]);
            concatenateTest("with [1,2] toAdd", [0, 1, 2, 3, 4], [1, 2], [0, 1, 2, 3, 4, 1, 2]);
            concatenateTest("with [4,5,6] toAdd", [0, 1, 2, 3, 4], [4, 5, 6], [0, 1, 2, 3, 4, 4, 5, 6]);
        });

        suite("takeCurrent()", () => {
            test("with empty iterator", () => {
                const iterable: qub.Iterable<number> = new qub.ArrayList<number>([]);
                const iterator: qub.Iterator<number> = iterable.iterate();
                assert.deepEqual(iterator.hasStarted(), false);
                assert.deepEqual(iterator.hasCurrent(), false);
                assert.deepEqual(iterator.getCurrent(), undefined);

                for (let i = 0; i < 2; ++i) {
                    assert.deepEqual(iterator.takeCurrent(), undefined);

                    assert.deepEqual(iterator.hasStarted(), true);
                    assert.deepEqual(iterator.hasCurrent(), false);
                    assert.deepEqual(iterator.getCurrent(), undefined);
                }
            });

            test("with non-empty iterator", () => {
                const iterable: qub.Iterable<number> = new qub.ArrayList<number>([7, 3, 1, 8]);
                const iterator: qub.Iterator<number> = iterable.iterate();
                assert.deepEqual(iterator.hasStarted(), false);
                assert.deepEqual(iterator.hasCurrent(), false);
                assert.deepEqual(iterator.getCurrent(), undefined);

                assert.deepEqual(iterator.takeCurrent(), undefined);

                assert.deepEqual(iterator.hasStarted(), true);
                assert.deepEqual(iterator.hasCurrent(), true);
                assert.deepEqual(iterator.getCurrent(), 7);

                assert.deepEqual(iterator.takeCurrent(), 7);

                assert.deepEqual(iterator.hasStarted(), true);
                assert.deepEqual(iterator.hasCurrent(), true);
                assert.deepEqual(iterator.getCurrent(), 3);
            });
        });

        suite("toArrayList()", () => {
            test("with empty iterator", () => {
                const iterable: qub.Iterable<number> = new qub.ArrayList<number>([]);
                const iterator: qub.Iterator<number> = iterable.iterate();
                assert.deepEqual(iterator.toArrayList().toArray(), []);
                assert.deepEqual(iterator.hasStarted(), true);
                assert.deepEqual(iterator.hasCurrent(), false);
            });

            test("with non-empty iterator", () => {
                const iterable: qub.Iterable<number> = new qub.ArrayList<number>([7, 3, 1, 8]);
                const iterator: qub.Iterator<number> = iterable.iterate();
                assert.deepEqual(iterator.toArrayList().toArray(), [7, 3, 1, 8]);
                assert.deepEqual(iterator.hasStarted(), true);
                assert.deepEqual(iterator.hasCurrent(), false);
            });
        });
    });

    suite("Iterable<T>", () => {
        suite("contains()", () => {
            function containsTest(testName: string, values: number[], searchFor: number, expected: boolean): void {
                test(testName, () => {
                    const ci = new qub.ArrayList(values);
                    assert.deepEqual(ci.contains(searchFor), expected);
                });
            }

            containsTest("with undefined values", undefined, 7, false);
            containsTest("with null values", null, 7, false);
            containsTest("with no values", [], 7, false);
            containsTest("with searchFor value not in values", [1, 2, 3], 7, false);
            containsTest("with searchFor value in values", [1, 7, 3], 7, true);

            test("with searchFor value in in values with comparer", () => {
                const ci = new qub.ArrayList([1, 2, 3]);
                assert.deepEqual(ci.contains(8, (lhs, rhs) => lhs % 2 === rhs % 2), true);
            });
        });

        suite("where()", () => {
            function whereTest(testName: string, originalValues: number[], condition: (value: number) => boolean, expectedValues: number[]): void {
                test(testName, () => {
                    const wi1: qub.Iterable<number> = new qub.ArrayList(originalValues).where(condition);
                    assert.deepEqual(wi1.toArray(), expectedValues);
                });
            }

            whereTest("with undefined condition", [0, 1, 2], undefined, [0, 1, 2]);
            whereTest("return odd numbers", [0, 1, 2, 3, 4, 5], (value: number) => value % 2 === 1, [1, 3, 5]);
            whereTest("return numbers greater than 2", [0, 1, 2, 3, 4, 5], (value: number) => value > 2, [3, 4, 5]);

            const whereIterable = new qub.ArrayList([0, 1, 2, 3, 4, 5, 6]).where((value: number) => value % 2 == 0);

            suite("any()", () => {
                function anyTest(testName: string, condition: (value: number) => boolean, expected: boolean): void {
                    test(testName, () => {
                        assert.deepEqual(whereIterable.any(condition), expected);
                    });
                }

                anyTest("with no condition", undefined, true);
                anyTest("with condition with no matches", (value: number) => value > 10, false);
                anyTest("with condition with matches", (value: number) => value > 1, true);
            });

            suite("first()", () => {
                function firstTest(testName: string, condition: (value: number) => boolean, expected: number): void {
                    test(testName, () => {
                        assert.deepEqual(whereIterable.first(condition), expected);
                    });
                }

                firstTest("with no condition", undefined, 0);
                firstTest("with condition with no matches", (value: number) => value > 10, undefined);
                firstTest("with condition with matches", (value: number) => value > 1, 2);
            });

            test("getCount()", () => {
                assert.deepEqual(whereIterable.getCount(), 4);
            });

            suite("last()", () => {
                function lastTest(testName: string, condition: (value: number) => boolean, expected: number): void {
                    test(testName, () => {
                        assert.deepEqual(whereIterable.last(condition), expected);
                    });
                }

                lastTest("with no condition", undefined, 6);
                lastTest("with condition with no matches", (value: number) => value > 10, undefined);
                lastTest("with condition with matches", (value: number) => value < 5, 4);
            });

            suite("where()", () => {
                function whereTest(testName: string, condition: (value: number) => boolean, expected: number[]): void {
                    test(testName, () => {
                        assert.deepEqual(whereIterable.where(condition).toArray(), expected);
                    });
                }

                whereTest("with no condition", undefined, [0, 2, 4, 6]);
                whereTest("with condition with no matches", (value: number) => value > 10, []);
                whereTest("with condition with matches", (value: number) => value > 1, [2, 4, 6]);
            });

            suite("skip()", () => {
                function skipTest(toSkip: number, expected: number[]): void {
                    test(`with ${toSkip}`, () => {
                        assert.deepEqual(whereIterable.skip(toSkip).toArray(), expected);
                    });
                }

                skipTest(undefined, [0, 2, 4, 6]);
                skipTest(0, [0, 2, 4, 6]);
                skipTest(1, [2, 4, 6]);
                skipTest(4, []);
                skipTest(10, []);
            });

            suite("take()", () => {
                function takeTest(toTake: number, expected: number[]): void {
                    test(`with ${toTake}`, () => {
                        assert.deepEqual(whereIterable.take(toTake).toArray(), expected);
                    });
                }

                takeTest(undefined, []);
                takeTest(0, []);
                takeTest(1, [0]);
                takeTest(4, [0, 2, 4, 6]);
                takeTest(10, [0, 2, 4, 6]);
            });

            suite("map()", () => {
                function mapTest(testName: string, mapFunction: (value: number) => string, expected: string[]): void {
                    test(testName, () => {
                        assert.deepEqual(whereIterable.map(mapFunction).toArray(), expected);
                    });
                }

                mapTest("with undefined mapFunction", undefined, []);
                mapTest("with toString() mapFunction", (value: number) => value.toString(), ["0", "2", "4", "6"]);
                mapTest("with *2 and toString() mapFunction", (value: number) => (value * 2).toString(), ["0", "4", "8", "12"]);
            });
        });

        suite("skip()", () => {
            function skipTest(testName: string, originalValues: number[], toSkip: number, expectedValues: number[]): void {
                test(testName, () => {
                    const si: qub.Iterable<number> = new qub.ArrayList<number>(originalValues)
                        // We have to do where() first to ensure that skip() will return a
                        // SkipIterable<T>.
                        .where((value: number) => true)
                        .skip(toSkip);
                    assert.deepEqual(si.toArray(), expectedValues, "Wrong toArray().");
                    assert.deepEqual(si.getCount(), qub.getLength(expectedValues), "Wrong getCount().")
                });
            }

            skipTest("with undefined toSkip", [0, 1, 2, 3, 4], undefined, [0, 1, 2, 3, 4]);
            skipTest("with 0 toSkip", [0, 1, 2, 3, 4], 0, [0, 1, 2, 3, 4]);
            skipTest("with 1 toSkip", [0, 1, 2, 3, 4], 1, [1, 2, 3, 4]);
            skipTest("with 4 toSkip", [0, 1, 2, 3, 4], 4, [4]);
            skipTest("with 5 toSkip", [0, 1, 2, 3, 4], 5, []);
            skipTest("with 200", [0, 1, 2, 3, 4], 200, []);

            const iterable = new qub.ArrayList([0, 1, 2, 3, 4]);
            suite("getCount()", () => {
                function getCountTest(toSkip: number, expectedCount: number): void {
                    test(`with ${toSkip} toSkip`, () => {
                        assert.deepEqual(iterable.skip(toSkip).getCount(), expectedCount);
                    });
                }

                getCountTest(undefined, 5);
                getCountTest(-1, 5);
                getCountTest(0, 5);
                getCountTest(1, 4);
                getCountTest(3, 2);
                getCountTest(5, 0);
                getCountTest(17, 0);
            });
        });

        suite("skipLast()", () => {
            function skipLastTest(originalValues: number[], toSkip: number, expectedValues: number[]): void {
                test(`with ${JSON.stringify(originalValues)} and ${toSkip}`, () => {
                    const ti: qub.Iterable<number> = new qub.ArrayList(originalValues)
                        .where((value: number) => true)
                        .skipLast(toSkip);
                    assert.deepEqual(ti.toArray(), expectedValues);
                    assert.deepEqual(ti.getCount(), expectedValues.length);
                });
            }

            skipLastTest(undefined, undefined, []);
            skipLastTest(undefined, null, []);
            skipLastTest(undefined, -3, []);
            skipLastTest(undefined, 0, []);
            skipLastTest(undefined, 7, []);
            skipLastTest(null, undefined, []);
            skipLastTest(null, null, []);
            skipLastTest(null, -1, []);
            skipLastTest(null, 0, []);
            skipLastTest(null, 2, []);
            skipLastTest([], undefined, []);
            skipLastTest([], null, []);
            skipLastTest([], -3, []);
            skipLastTest([], 0, []);
            skipLastTest([], 1, []);
            skipLastTest([0], undefined, [0]);
            skipLastTest([0], null, [0]);
            skipLastTest([0], -10, [0]);
            skipLastTest([0], 0, [0]);
            skipLastTest([0], 1, []);
            skipLastTest([0], 2, []);
            skipLastTest([0, 1, 2, 3, 4], undefined, [0, 1, 2, 3, 4]);
            skipLastTest([0, 1, 2, 3, 4], -1, [0, 1, 2, 3, 4]);
            skipLastTest([0, 1, 2, 3, 4], 0, [0, 1, 2, 3, 4]);
            skipLastTest([0, 1, 2, 3, 4], 1, [0, 1, 2, 3]);
            skipLastTest([0, 1, 2, 3, 4], 4, [0]);
            skipLastTest([0, 1, 2, 3, 4], 10, []);
        });

        suite("take()", () => {
            function takeTest(originalValues: number[], toTake: number, expectedValues: number[]): void {
                test(`with ${JSON.stringify(originalValues)} and ${toTake}`, () => {
                    const ti: qub.Iterable<number> = new qub.ArrayList(originalValues)
                        .map((value: number) => value)
                        .take(toTake);
                    assert.deepEqual(ti.toArray(), expectedValues, "Wrong toArray() with non-started take iterator.");
                    assert.deepEqual(ti.getCount(), expectedValues.length);
                });
            }

            takeTest(undefined, undefined, []);
            takeTest(undefined, null, []);
            takeTest(undefined, -3, []);
            takeTest(undefined, 0, []);
            takeTest(undefined, 7, []);
            takeTest(null, undefined, []);
            takeTest(null, null, []);
            takeTest(null, -1, []);
            takeTest(null, 0, []);
            takeTest(null, 2, []);
            takeTest([], undefined, []);
            takeTest([], null, []);
            takeTest([], -3, []);
            takeTest([], 0, []);
            takeTest([], 1, []);
            takeTest([0], undefined, []);
            takeTest([0], null, []);
            takeTest([0], -10, []);
            takeTest([0], 0, []);
            takeTest([0], 1, [0]);
            takeTest([0], 2, [0]);
            takeTest([0, 1, 2, 3, 4], undefined, []);
            takeTest([0, 1, 2, 3, 4], -1, []);
            takeTest([0, 1, 2, 3, 4], 0, []);
            takeTest([0, 1, 2, 3, 4], 1, [0]);
            takeTest([0, 1, 2, 3, 4], 4, [0, 1, 2, 3]);
            takeTest([0, 1, 2, 3, 4], 10, [0, 1, 2, 3, 4]);
        });

        suite("takeLast()", () => {
            function takeLastTest(originalValues: number[], toTake: number, expectedValues: number[]): void {
                test(`with ${JSON.stringify(originalValues)} and ${toTake} toTake`, () => {
                    assert.deepEqual(new qub.ArrayList(originalValues).takeLast(toTake).toArray(), expectedValues);
                });
            }

            takeLastTest([], -1, []);
            takeLastTest([0, 1, 2, 3], -1, []);
            takeLastTest([0, 1, 2, 3], 0, []);
            takeLastTest([0, 1, 2, 3], 1, [3]);
            takeLastTest([0, 1, 2, 3], 2, [2, 3]);
            takeLastTest([0, 1, 2, 3], 3, [1, 2, 3]);
            takeLastTest([0, 1, 2, 3], 4, [0, 1, 2, 3]);
            takeLastTest([0, 1, 2, 3], 5, [0, 1, 2, 3]);
        });

        suite("map()", () => {
            function mapTest(testName: string, originalValues: number[], mapFunction: (value: number) => string, expectedValues: string[]): void {
                test(testName, () => {
                    assert.deepEqual(new qub.ArrayList(originalValues).map(mapFunction).toArray(), expectedValues, "Wrong toArray() with non-started map iterable.");
                });
            }

            mapTest("with undefined mapFunction", [0, 1, 2, 3, 4], undefined, []);
            mapTest("with toString() mapFunction", [0, 1, 2, 3, 4], (value: number) => value.toString(), ["0", "1", "2", "3", "4"]);
            mapTest("with *2 and toString() mapFunction", [0, 1, 2, 3, 4], (value: number) => (value * 2).toString(), ["0", "2", "4", "6", "8"]);

            const mapIterable = new qub.ArrayList([0, 1, 2, 3]).map((value: number) => value.toString());;
            test("any()", () => {
                assert.deepEqual(mapIterable.any(), true);
                assert.deepEqual(mapIterable.any((value: string) => value === "1"), true);
                assert.deepEqual(mapIterable.any((value: string) => value === "-1"), false);
            });

            test("getCount()", () => {
                assert.deepEqual(mapIterable.getCount(), 4);
            });

            suite("contains()", () => {
                function containsTest(testName: string, values: number[], searchFor: string, expected: boolean): void {
                    test(testName, () => {
                        const mi = new qub.ArrayList(values).map((value) => value.toString());
                        assert.deepEqual(mi.contains(searchFor), expected);
                    });
                }

                containsTest("with undefined values", undefined, "7", false);
                containsTest("with null values", null, "7", false);
                containsTest("with no values", [], "7", false);
                containsTest("with searchFor value not in values", [1, 2, 3], "7", false);
                containsTest("with searchFor value in values", [1, 7, 3], "7", true);

                test("with searchFor value in in values with comparer", () => {
                    const ci = new qub.ArrayList([1, 2, 3]).map((value) => value.toString());
                    assert.deepEqual(ci.contains("200", (iterableValue, value) => value.substring(0, 1) === iterableValue), true);
                });
            });

            test("first()", () => {
                assert.deepEqual(mapIterable.first(), "0");
            });

            test("last()", () => {
                assert.deepEqual(mapIterable.last(), "3");
            });

            test("where()", () => {
                assert.deepEqual(mapIterable.where(undefined).toArray(), mapIterable.toArray());
                assert.deepEqual(mapIterable.where((value: string) => value === "2").toArray(), ["2"]);
            });

            test("skip()", () => {
                assert.deepEqual(mapIterable.skip(undefined).toArray(), mapIterable.toArray());
                assert.deepEqual(mapIterable.skip(-1).toArray(), mapIterable.toArray());
                assert.deepEqual(mapIterable.skip(2).toArray(), ["2", "3"]);
                assert.deepEqual(mapIterable.skip(10).toArray(), []);
            });

            test("skipLast()", () => {
                assert.deepEqual(mapIterable.skipLast(undefined).toArray(), mapIterable.toArray());
                assert.deepEqual(mapIterable.skipLast(-1).toArray(), mapIterable.toArray());
                assert.deepEqual(mapIterable.skipLast(2).toArray(), ["0", "1"]);
                assert.deepEqual(mapIterable.skipLast(10).toArray(), []);
            });

            test("take()", () => {
                assert.deepEqual(mapIterable.take(undefined).toArray(), [], "Wrong result when undefined taken.");
                assert.deepEqual(mapIterable.take(-1).toArray(), [], "Wrong result when -1 taken.");
                assert.deepEqual(mapIterable.take(3).toArray(), ["0", "1", "2"], "Wrong result when 3 taken.");
                assert.deepEqual(mapIterable.take(200).toArray(), mapIterable.toArray(), "Wrong result when 200 taken.");
            });

            test("takeLast()", () => {
                assert.deepEqual(mapIterable.takeLast(undefined).toArray(), [], "Wrong result when last undefined taken.");
                assert.deepEqual(mapIterable.takeLast(-1).toArray(), [], "Wrong result when last -1 taken.");
                assert.deepEqual(mapIterable.takeLast(3).toArray(), ["1", "2", "3"], "Wrong result when last 3 taken.");
                assert.deepEqual(mapIterable.takeLast(200).toArray(), mapIterable.toArray(), "Wrong result when last 200 taken.");
            });

            test("map()", () => {
                assert.deepEqual(mapIterable.map(undefined).toArray(), []);
                assert.deepEqual(mapIterable.map((value: string) => value + value).toArray(), ["00", "11", "22", "33"]);
            });

            test("concatenate()", () => {
                assert.deepEqual(mapIterable.concatenate(undefined).toArray(), ["0", "1", "2", "3"]);
                assert.deepEqual(mapIterable.concatenate(null).toArray(), ["0", "1", "2", "3"]);
                assert.deepEqual(mapIterable.concatenate([]).toArray(), ["0", "1", "2", "3"]);
                assert.deepEqual(mapIterable.concatenate(["4", "5"]).toArray(), ["0", "1", "2", "3", "4", "5"]);
            });

            suite("endsWith()", () => {
                function endsWithTest(values: number[], endingValues: string[], expected: boolean): void {
                    test(`with ${JSON.stringify(values)} and ${JSON.stringify(endingValues)}`, () => {
                        const mapValues: qub.Iterable<string> = new qub.ArrayList(values).map((value: number) => value.toString());
                        const mapEndingValues: qub.Iterable<string> = endingValues ? new qub.ArrayList(endingValues) : undefined;
                        assert.deepEqual(mapValues.endsWith(mapEndingValues), expected);
                    });
                }

                endsWithTest([], undefined, false);
                endsWithTest([1], undefined, false);
                endsWithTest([], [], false);
                endsWithTest([], ["1"], false);
                endsWithTest([1], [], false);
                endsWithTest([1], ["1"], true);
                endsWithTest([1], ["1", "2"], false);
                endsWithTest([1, 2, 3], ["3"], true);
                endsWithTest([1, 2, 3], ["2", "3"], true);
                endsWithTest([1, 2, 3], ["4", "3"], false);
                endsWithTest([1, 2, 3], ["2", "4"], false);
            });

            test("for..of", () => {
                const values: string[] = [];
                for (const value of mapIterable) {
                    values.push(value);
                }
                assert.deepEqual(values, ["0", "1", "2", "3"]);
            });
        });

        suite("concatenate()", () => {
            function concatenateTest(originalValues: number[], toConcatenate: number[], expectedValues: number[]): void {
                test(`with ${JSON.stringify(originalValues)} and ${JSON.stringify(toConcatenate)}`, () => {
                    const originalIterable = new qub.ArrayList<number>(originalValues);
                    const concatenateIterable: qub.Iterable<number> = toConcatenate ? new qub.ArrayList<number>(toConcatenate) : undefined;
                    assert.deepEqual(originalIterable.concatenate(concatenateIterable).toArray(), expectedValues);
                });
            }

            concatenateTest([], undefined, []);
            concatenateTest([], [], []);
            concatenateTest([0, 1, 2, 3], [], [0, 1, 2, 3]);
            concatenateTest([0, 1, 2, 3], [4], [0, 1, 2, 3, 4]);
            concatenateTest([0, 1, 2, 3], [4, 5], [0, 1, 2, 3, 4, 5]);
            concatenateTest([0, 1, 2, 3], [4, 5, 6], [0, 1, 2, 3, 4, 5, 6]);
            concatenateTest([], [0, 1, 2, 3], [0, 1, 2, 3]);
        });

        suite("endsWith()", () => {
            function endsWithTest(values: number[], endingValues: number[], expected: boolean): void {
                test(`with ${JSON.stringify(values)} and ${JSON.stringify(endingValues)}`, () => {
                    assert.deepEqual(new qub.ArrayList(values).endsWith(new qub.ArrayList(endingValues)), expected);
                });
            }

            test(`with [] and undefined`, () => {
                assert.deepEqual(new qub.ArrayList([]).endsWith(undefined), false);
            });

            test(`with [1] and undefined`, () => {
                assert.deepEqual(new qub.ArrayList([1]).endsWith(undefined), false);
            });

            endsWithTest([], [], false);
            endsWithTest([], [1], false);
            endsWithTest([1], [], false);
            endsWithTest([1], [1], true);
            endsWithTest([1], [1, 2], false);
            endsWithTest([1, 2, 3], [3], true);
            endsWithTest([1, 2, 3], [2, 3], true);
            endsWithTest([1, 2, 3], [4, 3], false);
            endsWithTest([1, 2, 3], [2, 4], false);
        });
    });

    suite("Indexable<T>", () => {
        suite("skip()", () => {
            function skipTest(originalValues: number[], toSkip: number, expectedValues: number[]): void {
                test(`with ${JSON.stringify(originalValues)} and ${toSkip}`, () => {
                    const si: qub.Indexable<number> = new qub.ArrayList<number>(originalValues).skip(toSkip);
                    assert.deepEqual(si.iterate().toArray(), expectedValues, "Wrong values.");

                    assert.deepEqual(si.iterateReverse().toArray(), expectedValues.reverse(), "Wrong reverse values.");
                    // Reverse changes the original array, so we have to reset it with another call.
                    expectedValues.reverse();

                    for (let i = -1; i <= expectedValues.length + 1; ++i) {
                        const expectedValue: number = (0 <= i && i < expectedValues.length ? expectedValues[i] : undefined);
                        assert.deepEqual(si.get(i), expectedValue, `Wrong get() value at index ${i}. ${si.get(i)} === ${expectedValue}`);
                    }

                    for (let i = -1; i <= expectedValues.length + 1; ++i) {
                        const expectedValue: number = (0 <= i && i < expectedValues.length ? expectedValues[expectedValues.length - 1 - i] : undefined);
                        assert.deepEqual(si.getFromEnd(i), expectedValue, `Wrong getFromEnd() value at index ${i}. ${si.getFromEnd(i)} === ${expectedValue}`);
                    }
                });
            }

            skipTest([], 3, []);
            skipTest([0, 1, 2, 3, 4], 2, [2, 3, 4]);
        });

        suite("take()", () => {
            function takeTest(originalValues: number[], toTake: number, expectedValues: number[]): void {
                test(`with ${JSON.stringify(originalValues)} and ${toTake}`, () => {
                    const ti: qub.Indexable<number> = new qub.ArrayList(originalValues).take(toTake);
                    assert.deepEqual(ti.toArray(), expectedValues);
                    assert.deepEqual(ti.getCount(), expectedValues.length);

                    for (let i = -1; i <= expectedValues.length + 1; ++i) {
                        assert.deepEqual(ti.get(i), 0 <= i && i < expectedValues.length ? expectedValues[i] : undefined);
                    }

                    assert.deepEqual(ti.iterateReverse().toArray(), expectedValues.reverse());
                });
            }

            takeTest(undefined, undefined, []);
            takeTest(undefined, null, []);
            takeTest(undefined, -3, []);
            takeTest(undefined, 0, []);
            takeTest(undefined, 7, []);
            takeTest(null, undefined, []);
            takeTest(null, null, []);
            takeTest(null, -1, []);
            takeTest(null, 0, []);
            takeTest(null, 2, []);
            takeTest([], undefined, []);
            takeTest([], null, []);
            takeTest([], -3, []);
            takeTest([], 0, []);
            takeTest([], 1, []);
            takeTest([0], undefined, []);
            takeTest([0], null, []);
            takeTest([0], -10, []);
            takeTest([0], 0, []);
            takeTest([0], 1, [0]);
            takeTest([0], 2, [0]);
            takeTest([0, 1, 2, 3, 4], undefined, []);
            takeTest([0, 1, 2, 3, 4], -1, []);
            takeTest([0, 1, 2, 3, 4], 0, []);
            takeTest([0, 1, 2, 3, 4], 1, [0]);
            takeTest([0, 1, 2, 3, 4], 4, [0, 1, 2, 3]);
            takeTest([0, 1, 2, 3, 4], 10, [0, 1, 2, 3, 4]);
        });
    });

    suite("Map", () => {
        test("constructor()", () => {
            const map = new qub.Map<string, number>();
            assert.deepEqual(map.getCount(), 0);
        });

        test("for..of", () => {
            const map = new qub.Map<number, string>();

            let values: qub.KeyValuePair<number, string>[] = [];
            for (const pair of map) {
                values.push(pair);
            }
            assert.deepEqual(values, []);

            map.add(10, "ten");
            for (const pair of map) {
                values.push(pair);
            }
            assert.deepEqual(values, [{ key: 10, value: "ten" }]);

            values = [];
            map.add(20, "twenty");
            for (const pair of map) {
                values.push(pair);
            }
            assert.deepEqual(values, [{ key: 10, value: "ten" }, { key: 20, value: "twenty" }]);
        });

        test("add()", () => {
            const map = new qub.Map<string, number>();
            assert.deepEqual(map.containsKey("hello"), false);

            map.add("hello", 5);
            assert.deepEqual(map.get("hello"), 5);
            assert.deepEqual(map.containsKey("hello"), true);

            map.add("hello", 6);
            assert.deepEqual(map.get("hello"), 6);
            assert.deepEqual(map.containsKey("hello"), true);
        });

        test("addAll()", () => {
            const map = new qub.Map<string, number>();
            map.addAll(undefined);
            assert.deepEqual(map.getCount(), 0);

            map.addAll(null);
            assert.deepEqual(map.getCount(), 0);

            map.addAll([]);
            assert.deepEqual(map.getCount(), 0);

            map.addAll([{ key: "one", value: 1 }, { key: "two", value: 2 }]);
            assert.deepEqual(map.getCount(), 2);
            assert.deepEqual(map.get("one"), 1);
            assert.deepEqual(map.get("two"), 2);

            map.addAll(new qub.ArrayList<qub.KeyValuePair<string, number>>([{ key: "three", value: 3 }]));
            assert.deepEqual(map.getCount(), 3);
            assert.deepEqual(map.get("one"), 1);
            assert.deepEqual(map.get("two"), 2);
            assert.deepEqual(map.get("three"), 3);
        });

        suite("get()", () => {
            test("with undefined", () => {
                const map = new qub.Map<string, number>();
                assert.deepEqual(map.get(undefined), undefined);
            });

            test("with null", () => {
                const map = new qub.Map<string, number>();
                assert.deepEqual(map.get(null), undefined);
            });
        });

        test("iterate()", () => {
            const map = new qub.Map<number, string>();
            assert.deepEqual(map.iterate().toArray(), []);

            map.add(5, "five");
            assert.deepEqual(map.iterate().toArray(), [{ key: 5, value: "five" }]);
        });

        test("iterateReverse()", () => {
            const map = new qub.Map<number, string>();
            assert.deepEqual(map.iterateReverse().toArray(), []);

            map.add(5, "five");
            assert.deepEqual(map.iterateReverse().toArray(), [{ key: 5, value: "five" }]);
        });
    });

    suite("Span", () => {
        suite("constructor(number,number)", () => {
            function constructorTest(startIndex: number, length: number): void {
                test(`with ${startIndex} and ${length}`, () => {
                    const span = new qub.Span(startIndex, length);
                    assert.deepEqual(span.startIndex, startIndex);
                    assert.deepEqual(span.length, length);
                    assert.deepEqual(span.afterEndIndex, startIndex + length);
                    assert.deepEqual(span.endIndex, startIndex + length - 1);
                    assert.deepEqual(span.toString(), `[${startIndex},${startIndex + length})`);
                });
            }

            constructorTest(0, 0);
            constructorTest(0, 1);
            constructorTest(0, 2);
            constructorTest(3, 2);
        });
    });

    suite("Lex", () => {
        suite("constructor()", () => {
            test("with LeftCurlyBracket and 0", () => {
                const t = new qub.Lex("{", 0, qub.LexType.LeftCurlyBracket);
                assert.deepEqual(t.getType(), qub.LexType.LeftCurlyBracket);
                assert.deepEqual(t.startIndex, 0);
                assert.deepEqual(t.afterEndIndex, 1);
                assert.deepEqual(t.span, new qub.Span(0, 1));
                assert.deepEqual(t.toString(), "{");
                assert.deepEqual(t.isWhitespace(), false);
                assert.deepEqual(t.isNewLine(), false);
            });

            test("with RightCurlyBracket and 17", () => {
                const t = new qub.Lex("}", 17, qub.LexType.RightCurlyBracket);
                assert.deepEqual(t.getType(), qub.LexType.RightCurlyBracket);
                assert.deepEqual(t.startIndex, 17);
                assert.deepEqual(t.afterEndIndex, 18);
                assert.deepEqual(t.span, new qub.Span(17, 1));
                assert.deepEqual(t.toString(), "}");
                assert.deepEqual(t.isWhitespace(), false);
                assert.deepEqual(t.isNewLine(), false);
            });

            test("with Space and 11", () => {
                const t = new qub.Lex(" ", 11, qub.LexType.Space);
                assert.deepEqual(t.getType(), qub.LexType.Space);
                assert.deepEqual(t.startIndex, 11);
                assert.deepEqual(t.afterEndIndex, 12);
                assert.deepEqual(t.span, new qub.Span(11, 1));
                assert.deepEqual(t.toString(), " ");
                assert.deepEqual(t.isWhitespace(), true);
                assert.deepEqual(t.isNewLine(), false);
            });

            test("with CarriageReturnNewLine and 11", () => {
                const t = new qub.Lex("\r\n", 11, qub.LexType.CarriageReturnNewLine);
                assert.deepEqual(t.getType(), qub.LexType.CarriageReturnNewLine);
                assert.deepEqual(t.startIndex, 11);
                assert.deepEqual(t.afterEndIndex, 13);
                assert.deepEqual(t.span, new qub.Span(11, 2));
                assert.deepEqual(t.toString(), "\r\n");
                assert.deepEqual(t.isWhitespace(), false);
                assert.deepEqual(t.isNewLine(), true);
            });
        });
    });

    suite("Lexer", () => {
        suite("constructor()", () => {
            function constructorTest(text: string): void {
                test(`with ${qub.escapeAndQuote(text)}`, () => {
                    const lexer = new qub.Lexer(text);
                    assert.deepEqual(lexer.hasStarted(), false);
                });
            }

            constructorTest(null);
            constructorTest(undefined);
            constructorTest("");
            constructorTest("{}");
            constructorTest("{}");
        });

        suite("next()", () => {
            function nextTest(text: string, expectedTokens: qub.Lex[]): void {
                test(`with ${qub.quote(qub.escape(text))}`, () => {
                    const lexer = new qub.Lexer(text);

                    for (const expectedToken of expectedTokens) {
                        assert.deepEqual(lexer.next(), true, "Wrong next()");
                        assert.deepEqual(lexer.hasStarted(), true, "Wrong hasStarted()");
                        assert.deepEqual(lexer.getCurrent(), expectedToken, "Wrong getCurrent()");
                    }

                    for (let i: number = 0; i < 2; ++i) {
                        assert.deepEqual(lexer.next(), false);
                        assert.deepEqual(lexer.hasStarted(), true);
                        assert.deepEqual(lexer.getCurrent(), undefined);
                    }
                });
            }

            nextTest(null, []);
            nextTest(undefined, []);
            nextTest("", []);
            nextTest("{", [qub.LeftCurlyBracket(0)]);
            nextTest("}", [qub.RightCurlyBracket(0)]);
            nextTest("[", [qub.LeftSquareBracket(0)]);
            nextTest("]", [qub.RightSquareBracket(0)]);
            nextTest("<", [qub.LeftAngleBracket(0)]);
            nextTest(">", [qub.RightAngleBracket(0)]);
            nextTest(" ", [qub.Space(0)]);
            nextTest("  ", [qub.Space(0), qub.Space(1)]);
            nextTest("\t", [qub.Tab(0)]);
            nextTest("\r", [qub.CarriageReturn(0)]);
            nextTest("\n", [qub.NewLine(0)]);
            nextTest("\r\n", [qub.CarriageReturnNewLine(0)]);
            nextTest("\ra", [qub.CarriageReturn(0), qub.Letters("a", 1)]);
            nextTest("abc", [qub.Letters("abc", 0)]);
            nextTest("null", [qub.Letters("null", 0)]);
            nextTest(`"`, [qub.DoubleQuote(0)]);
            nextTest("'", [qub.SingleQuote(0)]);
            nextTest("789", [qub.Digits("789", 0)]);
            nextTest("3.6",
                [
                    qub.Digits("3", 0),
                    qub.Period(1),
                    qub.Digits("6", 2)
                ]);
            nextTest("1.2.3",
                [
                    qub.Digits("1", 0),
                    qub.Period(1),
                    qub.Digits("2", 2),
                    qub.Period(3),
                    qub.Digits("3", 4)
                ]);
            nextTest("-5",
                [
                    qub.Dash(0),
                    qub.Digits("5", 1)
                ]);
            nextTest("-3.6",
                [
                    qub.Dash(0),
                    qub.Digits("3", 1),
                    qub.Period(2),
                    qub.Digits("6", 3)
                ]);
            nextTest("-1.2.3",
                [
                    qub.Dash(0),
                    qub.Digits("1", 1),
                    qub.Period(2),
                    qub.Digits("2", 3),
                    qub.Period(4),
                    qub.Digits("3", 5)
                ]);
            nextTest(",", [qub.Comma(0)]);
            nextTest(":", [qub.Colon(0)]);
            nextTest(";", [qub.Semicolon(0)]);
            nextTest("!", [qub.ExclamationPoint(0)]);
            nextTest("\\", [qub.Backslash(0)]);
            nextTest("/", [qub.ForwardSlash(0)]);
            nextTest("?", [qub.QuestionMark(0)]);
            nextTest("-", [qub.Dash(0)]);
            nextTest("+", [qub.Plus(0)]);
            nextTest("=", [qub.EqualsSign(0)]);
            nextTest(".", [qub.Period(0)]);
            nextTest("_", [qub.Underscore(0)]);
            nextTest("&", [qub.Ampersand(0)]);
            nextTest("*", [qub.Asterisk(0)]);
            nextTest("(", [qub.LeftParenthesis(0)]);
            nextTest(")", [qub.RightParenthesis(0)]);
            nextTest("#", [qub.Hash(0)]);
            nextTest("|", [qub.VerticalBar(0)]);
            nextTest("%", [qub.Percent(0)]);
            nextTest("^", [qub.Unrecognized("^", 0)]);
        });
    });

    suite("isLetter(string)", () => {
        test(`with "a"`, () => {
            assert.deepEqual(qub.isLetter("a"), true);
        });

        test(`with "A"`, () => {
            assert.deepEqual(qub.isLetter("A"), true);
        });

        test(`with "z"`, () => {
            assert.deepEqual(qub.isLetter("z"), true);
        });

        test(`with "Z"`, () => {
            assert.deepEqual(qub.isLetter("Z"), true);
        });

        test(`with " "`, () => {
            assert.deepEqual(qub.isLetter(" "), false);
        });

        test(`with "."`, () => {
            assert.deepEqual(qub.isLetter("."), false);
        });
    });

    suite("isDigit(string)", () => {
        test(`with "0"`, () => {
            assert.deepEqual(qub.isDigit("0"), true);
        });

        test(`with "5"`, () => {
            assert.deepEqual(qub.isDigit("5"), true);
        });

        test(`with "9"`, () => {
            assert.deepEqual(qub.isDigit("9"), true);
        });

        test(`with "a"`, () => {
            assert.deepEqual(qub.isDigit("a"), false);
        });

        test(`with " "`, () => {
            assert.deepEqual(qub.isDigit(" "), false);
        });

        test(`with "Z"`, () => {
            assert.deepEqual(qub.isDigit("Z"), false);
        });
    });

    suite("isWhitespace(string)", () => {
        function isWhitespaceTest(value: string, expected: boolean): void {
            test(`with ${qub.escapeAndQuote(value)}`, () => {
                assert.deepEqual(qub.isWhitespace(value), expected);
            });
        }

        isWhitespaceTest("0", false);
        isWhitespaceTest("5", false);
        isWhitespaceTest("9", false);
        isWhitespaceTest("a", false);
        isWhitespaceTest(" ", true);
        isWhitespaceTest("\t", true);
        isWhitespaceTest("\r", true);
        isWhitespaceTest("\r\n", false);
        isWhitespaceTest("\n", false);
        isWhitespaceTest("Z", false);
    });

    test("readWhitespace()", () => {
        const iterator = new qub.StringIterator(" \t\rabc ");
        assert.deepEqual(qub.readWhitespace(iterator), " \t\r");
        assert.deepEqual(qub.readWhitespace(iterator), "");

        qub.readLetters(iterator);

        assert.deepEqual(qub.readWhitespace(iterator), " ");
        assert.deepEqual(iterator.hasCurrent(), false);
    });

    suite("absoluteValue()", () => {
        function absoluteValueTest(value: number, expected: number): void {
            test(`with ${value}`, () => {
                assert.deepEqual(qub.absoluteValue(value), expected);
            });
        }

        absoluteValueTest(undefined, undefined);
        absoluteValueTest(null, null);
        absoluteValueTest(0, 0);
        absoluteValueTest(1, 1);
        absoluteValueTest(-1, 1);
    });

    suite("StringIterator", () => {
        function stringIteratorTest(text: string, startIndex: number, endIndex: number, expectedValues: string[]): void {
            test(`with text: ${qub.quote(qub.escape(text))}, startIndex: ${startIndex}, and endIndex: ${endIndex}`, () => {
                const iterator = new qub.StringIterator(text, startIndex, endIndex);
                assert.deepEqual(iterator.hasStarted(), false);
                assert.deepEqual(iterator.hasCurrent(), false);
                assert.deepEqual(iterator.getCurrent(), undefined);

                for (const expectedValue of expectedValues) {
                    assert.deepEqual(iterator.next(), true, `Wrong next() when expecting ${qub.escapeAndQuote(expectedValue)}`);
                    assert.deepEqual(iterator.hasStarted(), true, "Wrong hasStarted()");
                    assert.deepEqual(iterator.getCurrent(), expectedValue, "Wrong getCurrent()");
                }

                for (let i: number = 0; i < 2; ++i) {
                    assert.deepEqual(iterator.next(), false);
                    assert.deepEqual(iterator.hasStarted(), true);
                    assert.deepEqual(iterator.getCurrent(), undefined);
                    assert.deepEqual(iterator.currentIndex, undefined);
                }
            });
        }

        stringIteratorTest(undefined, 0, 0, []);
        stringIteratorTest("hello", 0, 5, ["h", "e", "l", "l", "o"]);
        stringIteratorTest("hello", 1, 3, ["e", "l"]);
        stringIteratorTest("hello", 4, -1, ["o", "l", "l", "e", "h"]);
    });

    suite("StringIterable", () => {
        test("with undefined", () => {
            const iterable = new qub.StringIterable(undefined);
            assert.deepEqual(iterable.any(), false);
            assert.deepEqual(iterable.getCount(), 0);
            assert.deepEqual(qub.getCombinedText(iterable), "");
            assert.deepEqual(qub.getCombinedText(iterable.iterateReverse()), "");
        });

        test("with null", () => {
            const iterable = new qub.StringIterable(null);
            assert.deepEqual(iterable.any(), false);
            assert.deepEqual(iterable.getCount(), 0);
            assert.deepEqual(qub.getCombinedText(iterable), "");
            assert.deepEqual(qub.getCombinedText(iterable.iterateReverse()), "");
        });

        test(`with ""`, () => {
            const iterable = new qub.StringIterable("");
            assert.deepEqual(iterable.any(), false);
            assert.deepEqual(iterable.getCount(), 0);
            assert.deepEqual(qub.getCombinedText(iterable), "");
            assert.deepEqual(qub.getCombinedText(iterable.iterateReverse()), "");
        });

        test(`with "apples"`, () => {
            const iterable = new qub.StringIterable("apples");
            assert.deepEqual(iterable.any(), true);
            assert.deepEqual(iterable.getCount(), 6);
            assert.deepEqual(qub.getCombinedText(iterable), "apples");
            assert.deepEqual(qub.getCombinedText(iterable.iterateReverse()), "selppa");
        });
    });

    suite("Error()", () => {
        function errorTest(message: string, span: qub.Span): void {
            test(`with ${qub.escapeAndQuote(message)} and ${span.toString()}`, () => {
                const error: qub.Issue = qub.Error(message, span);
                assert.deepEqual(error.message, message);
                assert.deepEqual(error.startIndex, span.startIndex);
                assert.deepEqual(error.length, span.length);
                assert.deepEqual(error.span, span);
                assert.deepEqual(error.afterEndIndex, span.afterEndIndex);
                assert.deepEqual(error.type, qub.IssueType.Error);
            });
        }

        errorTest(null, new qub.Span(0, 0));
        errorTest(undefined, new qub.Span(0, 1));
        errorTest("", new qub.Span(57, 38));
        errorTest("Hello!", new qub.Span(1, 2));
    });

    suite("Warning()", () => {
        function warningTest(message: string, span: qub.Span): void {
            test(`with ${qub.escapeAndQuote(message)} and ${span.toString()}`, () => {
                const warning: qub.Issue = qub.Warning(message, span);
                assert.deepEqual(warning.message, message);
                assert.deepEqual(warning.startIndex, span.startIndex);
                assert.deepEqual(warning.length, span.length);
                assert.deepEqual(warning.span, span);
                assert.deepEqual(warning.afterEndIndex, span.afterEndIndex);
                assert.deepEqual(warning.type, qub.IssueType.Warning);
            });
        }

        warningTest(null, new qub.Span(0, 0));
        warningTest(undefined, new qub.Span(0, 1));
        warningTest("", new qub.Span(57, 38));
        warningTest("Hello!", new qub.Span(1, 2));
    });
});