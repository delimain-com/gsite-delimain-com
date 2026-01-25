import {ChangeDetectorRef, Component, computed, DestroyRef, effect, inject, signal, untracked, WritableSignal} from '@angular/core';
import {DecimalPipe, JsonPipe} from "@angular/common";
import {injectQueryParams} from "ngxtension/inject-query-params";
import {Observable, switchMap, take, tap} from "rxjs";
import {ApiService} from "../../../service/api/api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {UtilService} from "../../../service/util/util.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {SiteInfoService} from "../../../service/site-info/site-info.service";
import {FormsModule} from "@angular/forms";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";

@Component({
	selector: 'app-event-list',
	imports: [
		RouterLink,
		FormsModule,
		DecimalPipe
	],
	templateUrl: './event-list.component.html',
	styleUrl: './event-list.component.scss',
})
export default class EventListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);

	public changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	private notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	private api: ApiService = inject(ApiService);

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	$queryParams = injectQueryParams();

	$q_title: WritableSignal<string | undefined> = signal(undefined);
	$q_page: WritableSignal<number> = signal(1);
	$q_limit: WritableSignal<number> = signal(100);

	$params = computed(() => {
		const params: any = {query: {}};
		{
			params.query.title = this.$q_title() || '';
		}
		return params;
	});

	$isReady: WritableSignal<boolean> = signal(false);

	$eventList: WritableSignal<any> = signal(undefined);
	$eventListCount: WritableSignal<number | undefined> = signal(undefined);

	constructor() {
		this.activatedRoute.queryParams
			.pipe(
				tap(() => this.$isReady.set(false)),
				switchMap(() => this.load()),
				tap(() => this.$isReady.set(true)),
			)
			.subscribe();
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		{
			this.$eventList.set(undefined);
			this.$eventListCount.set(undefined);
		}
		const params = this.$params();
		return this.api.post('page/eventList/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					{
						this.$eventList.set(results.eventList || []);
					}
					{
						this.$eventListCount.set(results.eventListCount || 0);
					}
					this.$load_isWait.set(false);
				}),
				take(1)
			);
	}

	$load_eventList_isWait: WritableSignal<boolean> = signal(false);

	load_eventList(): Observable<any> {
		this.$load_eventList_isWait.set(true);
		{
			this.$eventList.set(undefined);
			this.$eventListCount.set(undefined);
		}
		const params = this.$params();
		return this.api.post('page/eventList/load_eventList', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					{
						this.$eventList.set(results.eventList || []);
					}
					{
						this.$eventListCount.set(results.eventListCount || 0);
					}
					this.$load_eventList_isWait.set(false);
				}),
				take(1)
			);
	}

	action_load_eventList(): void {
		this.load_eventList()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	remove_event(event: any): Observable<any> {
		const params: any = {event};
		this.notifyMessage.show('削除中...');
		return this.api.post('page/eventList/remove_event', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.$eventList.update((eventList: any) => {
						return eventList.filter((event: any) => event.uid !== params.event.uid);
					});
					this.notifyMessage.hide('削除しました');
				}),
				take(1)
			);
	}

	action_remove_event(event: any): void {
		if (!confirm('削除は取り消せません')) {
			return;
		}
		this.remove_event(event)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	event_viewFlag(event: any): Observable<any> {
		const params: any = {event: {...event, viewFlag: !event.viewFlag}};
		this.notifyMessage.show('保存中...');
		return this.api.post('page/eventList/save_event_viewFlag', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					event.viewFlag = params.event.viewFlag;
					this.changeDetectorRef.detectChanges();
					this.notifyMessage.hide('保存しました');
				}),
				take(1)
			);
	}

	action_event_viewFlag(event: any): void {
		this.event_viewFlag(event)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

}
