import {computed, effect, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {ApiService} from "../api/api.service";
import {Observable, tap} from "rxjs";
import {injectQueryParams} from "ngxtension/inject-query-params";
import {injectNavigationEnd} from "ngxtension/navigation-end";

@Injectable({
	providedIn: 'root',
})
export class SiteInfoService {

	private api: ApiService = inject(ApiService);

	public $isReady: WritableSignal<boolean> = signal(false);

	public $siteList: WritableSignal<any> = signal(undefined);
	public $langList: WritableSignal<any> = signal(undefined);

	public $langMap = computed(() => {
		const langList = this.$langList();
		if (!langList) {
			return {};
		}
		return langList.reduce((langMap: any, lang: any) => {
			langMap[lang.uid] = lang;
			langMap[lang.lang] = lang;
			return langMap;
		}, {});
	});
	public $siteMap = computed(() => {
		return (this.$siteList() || []).reduce((siteMap: any, site: any) => {
			siteMap[site.uid] = site;
			siteMap[site.domain] = site;
			return siteMap;
		}, {});
	});

	public $domain = injectQueryParams('domain');
	public $site = computed(() => {
		const domain = this.$domain();
		if (!domain) {
			return {};
		}
		const siteMap = this.$siteMap() || {};
		const site = siteMap[domain] || {};
		return site;
	});
	public $site_langList = computed(() => {
		const site = this.$site();
		if (!site?.uid) {
			return [];
		}
		const langList = this.$langList() || [];
		return langList.filter((lang: any) => lang?.uid === site?.uid);
	});

	constructor() {
	}

	load(): Observable<any> {
		return this.api.post('fn/siteInfo/load')
			.pipe(
				tap(({results}) => {
					this.$siteList.set(results?.siteList || []);
					this.$langList.set(results?.langList || []);
					this.$isReady.set(true);
				})
			);
	}

}
