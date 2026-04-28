type StringKeys<T> = string & keyof T;

type Leaf<P extends string, K extends string> = `${P}${K}`;

type Branch<P extends string, K extends string> = `${Leaf<P, K>}.`;

export type Paths<T, P extends string = ''> = {
	[K in StringKeys<T>]: T[K] extends object
		? Paths<T[K], Branch<P, K>>
		: Leaf<P, K>;
}[StringKeys<T>];
