import classNames from "@/src/shared/lib/classnames/classnames";

describe("classNames", () => {
  test("with only first param", () => {
    expect(classNames("someclass")).toBe("someclass");
  });
  test("with additional class", () => {
    const expected: string = "someclass class1 class2";
    expect(classNames("someclass", {}, ["class1", "class2"])).toBe(expected);
  });

  test("with mods", () => {
    const expected: string = "someclass class1 class2 hovered scrollable";
    expect(classNames("someclass", { hovered: true, scrollable: true }, ["class1", "class2"])).toBe(
      expected,
    );
  });
  test("with mods false", () => {
    const expected: string = "someclass class1 class2 hovered";
    expect(
      classNames("someclass", { hovered: true, scrollable: false }, ["class1", "class2"]),
    ).toBe(expected);
  });
  test("with mods undefined", () => {
    const expected: string = "someclass class1 class2 scrollable";
    expect(
      classNames("someclass", { hovered: undefined, scrollable: true }, ["class1", "class2"]),
    ).toBe(expected);
  });
});
