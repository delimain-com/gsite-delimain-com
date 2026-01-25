export interface InfoModel {
	uid: string;
	no?: number;
	lang: string;
	title?: string;
	viewDatetime?: string | number;
	regDatetime?: string | number;
	imagePath?: string;
	imageSrc?: string;
	viewFlag?: boolean;
	sort?: string;
}