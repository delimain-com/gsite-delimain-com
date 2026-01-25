import {Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild, WritableSignal} from '@angular/core';
import {UtilService} from "../../../service/util/util.service";
import {ApiService} from "../../../service/api/api.service";
import {injectQueryParams} from "ngxtension/inject-query-params";
import {Observable, of, switchMap, take, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SiteInfoService} from "../../../service/site-info/site-info.service";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";
import {InfoDetailModel} from "../../../model/info-detail.model";
import {InfoModel} from "../../../model/info.model";
import {FormsModule} from "@angular/forms";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import ElCkeditorComponent from "../../el/el-ckeditor/el-ckeditor.component";
import {ImageUtilService} from "../../../service/image-util/image-util.service";
import {JsonPipe} from "@angular/common";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: 'app-info-edit',
	imports: [
		NgbNav,
		NgbNavItem,
		NgbNavLinkButton,
		NgbNavContent,
		NgbNavOutlet,
		FormsModule,
		ElCkeditorComponent,
	],
	templateUrl: './info-edit.component.html',
	styleUrl: './info-edit.component.scss',
})
export default class InfoEditComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public imageUtil: ImageUtilService = inject(ImageUtilService);

	public util: UtilService = inject(UtilService);

	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	private api: ApiService = inject(ApiService);

	private activedRoute: ActivatedRoute = inject(ActivatedRoute);

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	public $isReady: WritableSignal<any> = signal(false);

	public $queryParams = injectQueryParams();
	public $q_uid = injectQueryParams('uid');

	public $results: WritableSignal<any> = signal(undefined);
	public $info: WritableSignal<any> = signal(undefined);
	public $infoDetailList: WritableSignal<InfoDetailModel[] | undefined> = signal(undefined);
	public $infoDetailMap = computed(() => {
		const infoDetailList = this.$infoDetailList() || [];
		const infoDetailMap = infoDetailList.reduce((infoDetailMap: any, info: InfoModel) => {
			infoDetailMap[info.lang] = info;
			// infoDetailMap[info.lang] || (infoDetailMap[info.lang].body = '');
			return infoDetailMap;
		}, {});
		this.siteInfo.$site_langList().forEach((site_lang: any) => {
			const lang = site_lang.lang;
			if (!infoDetailMap[lang]) {
				infoDetailMap[lang] = {lang};
				// infoDetailMap[lang] = {lang, body: ''};
			}
		});
		return infoDetailMap;
	});

	public $el_file = viewChild<ElementRef>('el_file');

	constructor() {
		this.activedRoute.queryParams
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.$isReady.set(false)),
				switchMap(() => this.load()),
				tap(() => this.$isReady.set(true))
			)
			.subscribe();
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		const params: any = {query: {}};
		{
			params.query.uid = this.$q_uid();
		}
		return this.api.post('page/infoEdit/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					{
						const now = Date.now();
						const info: InfoModel = results.info || {
							uid: this.$q_uid(),
							regDatetime: now,
							viewDatetime: now,
							viewFlag: true,
							sort: now
						};
						this.$info.set(info);
					}
					{
						this.$infoDetailList.set(results.infoDetailList || []);
					}
					this.$load_isWait.set(false);
				}),
				take(1)
			);
	}

	$save_isWait: WritableSignal<boolean> = signal(false);

	save(): Observable<any> {
		const params: any = {
			info: this.$info(),
			infoDetailList: Object.values(this.$infoDetailMap())
		};
		this.notifyMessage.show('保存中...');
		this.$save_isWait.set(true);
		return this.api.post('page/infoEdit/save', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.$save_isWait.set(false);
					this.notifyMessage.hide('保存しました');
				}),
				take(1)
			);
	}

	action_save(): void {
		this.save()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	$upload_image_isWait: WritableSignal<boolean> = signal(false);

	upload_image(): Observable<any> {
		this.$upload_image_isWait.set(true);
		const info = this.$info();
		const el_file: any = this.$el_file()?.nativeElement;
		const file = el_file.files?.[0];
		const path = `info/${info?.uid}/${this.util.ulid()}.png`;
		const params: any = {path, file};
		return this.imageUtil.upload(params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$info.update((info: InfoModel) => {
						info.imagePath = results.path;
						info.imageSrc = results.src;
						return {...info};
					});
					this.$upload_image_isWait.set(false);
				}),
				take(1)
			);
	}

	protected action_upload_image() {
		this.upload_image()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}
}
