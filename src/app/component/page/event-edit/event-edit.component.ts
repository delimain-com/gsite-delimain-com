import {Component, computed, DestroyRef, ElementRef, HostListener, inject, signal, viewChild, WritableSignal} from '@angular/core';
import {UtilService} from "../../../service/util/util.service";
import {SiteInfoService} from "../../../service/site-info/site-info.service";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";
import {Observable, Subject, switchMap, take, tap} from "rxjs";
import {injectQueryParams} from "ngxtension/inject-query-params";
import {ApiService} from "../../../service/api/api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute} from "@angular/router";
import ElCkeditorComponent from "../../el/el-ckeditor/el-ckeditor.component";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ImageUtilService} from "../../../service/image-util/image-util.service";

@Component({
	selector: 'app-event-edit',
	imports: [
		ElCkeditorComponent,
		NgbNav,
		NgbNavContent,
		NgbNavItem,
		NgbNavLinkButton,
		ReactiveFormsModule,
		NgbNavOutlet,
		FormsModule
	],
	templateUrl: './event-edit.component.html',
	styleUrl: './event-edit.component.scss',
})
export default class EventEditComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);

	private api: ApiService = inject(ApiService);
	private imageUtil: ImageUtilService = inject(ImageUtilService);
	private notifyMessage: NotifyMessageService = inject(NotifyMessageService);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	public $isReady: WritableSignal<boolean> = signal(false);

	public $q_uid = injectQueryParams('uid');

	public $results: WritableSignal<any> = signal({});
	public $event: WritableSignal<any> = signal(undefined);
	public $eventDetailList: WritableSignal<any> = signal(undefined);
	public $eventDetailMap = computed(() => {
		const eventDetailList = this.$eventDetailList() || [];
		const eventDetailMap = eventDetailList.reduce((eventDetailMap: any, event: any) => {
			eventDetailMap[event.lang] = event;
			// eventDetailMap[event.lang] || (eventDetailMap[event.lang].body = '');
			return eventDetailMap;
		}, {});
		this.siteInfo.$site_langList().forEach((site_lang: any) => {
			const lang = site_lang.lang;
			if (!eventDetailMap[lang]) {
				eventDetailMap[lang] = {lang};
				// eventDetailMap[lang] = {lang, body: ''};
			}
		});
		return eventDetailMap;
	});

	public $el_file = viewChild<ElementRef>('el_file');

	constructor() {
		this.activatedRoute.queryParams
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.$isReady.set(false)),
				switchMap(() => this.load()),
				tap(() => this.$isReady.set(true)),
			)
			.subscribe();
	}

	load(): Observable<any> {
		const params: any = {query: {uid: this.$q_uid()}};
		return this.api.post('page/eventEdit/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					{
						const now = Date.now();
						this.$event.set(results.event || {
							uid: this.$q_uid(),
							regDatetime: now,
							viewDatetime: now,
							viewFlag: true,
							sort: now
						});
					}
					this.$eventDetailList.set(results.eventDetailList || []);
					this.$results.set(results);
				}),
				take(1)
			);
	}

	$upload_image_isWait: WritableSignal<boolean> = signal(false);

	upload_image(): Observable<any> {
		this.$upload_image_isWait.set(true);
		const event = this.$event();
		const el_file: any = this.$el_file()?.nativeElement;
		const file = el_file.files?.[0];
		const path = `event/${event?.uid}/${this.util.ulid()}.png`;
		const params: any = {path, file};
		return this.imageUtil.upload(params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$event.update((event: any) => {
						event.imagePath = results.path;
						event.imageSrc = results.src;
						return {...event};
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

	$save_isWait: WritableSignal<boolean> = signal(false);

	save(): Observable<any> {
		const params: any = {
			event: this.$event(),
			eventDetailList: Object.values(this.$eventDetailMap())
		};
		this.notifyMessage.show('保存中...');
		this.$save_isWait.set(true);
		return this.api.post('page/eventEdit/save', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.$save_isWait.set(false);
					this.notifyMessage.hide('保存しました');
				}),
				take(1)
			);
	}

	save$ = (() => {
		const save$ = new Subject();
		save$
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				switchMap(() => this.save())
			)
			.subscribe();
		return save$;
	})();

	action_save(): void {
		this.save$.next(null);
		// this.save()
		// 	.pipe(
		// 		takeUntilDestroyed(this.#DestroyRef),
		// 		take(1)
		// 	)
		// 	.subscribe();
	}

}
