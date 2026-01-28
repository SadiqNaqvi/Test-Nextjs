// type Arguments<A> = A extends undefined ? [] : A[]

type Arguments<A> =
    A extends undefined ? [] :
    A extends any[] ? A : [A];
export type TypedFunction<A = undefined, R = void> = (...args: Arguments<A>) => R