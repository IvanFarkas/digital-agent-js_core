export const createSpyObj = (name: string, methodNames: string[], properties?: object): {[key: string]: jest.Mock<any>} => {
  const obj: any = {};

  if (properties) {
    for (const [property, value] of Object.entries(properties)) {
      obj[property] = value;
    }
  }
  methodNames.forEach((methodName: string) => {
    obj[methodName] = jest
      .fn()
      .mockName(methodName)
      .mockImplementation(() => {});
  });
  return obj;
};

type MockableFunction = (...args: any[]) => any;

// Use generic constraints to restrict `mockedFunc` to be any type of function
export const asMock = <Func extends MockableFunction>(mockedFunc: Func) => mockedFunc as jest.MockedFunction<typeof mockedFunc>;
