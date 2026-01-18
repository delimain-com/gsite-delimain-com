declare module 'fast-path-set' {
	/**
	 * オブジェクトに値をセットします。
	 * @param obj 対象のオブジェクト
	 * @param path 文字列パス (例: 'a.b.c')
	 * @param value セットする値
	 */
	function set(obj: any, path: string, value: any): void;
	export default set;
}