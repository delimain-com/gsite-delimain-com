import {inject, Injectable, WritableSignal} from '@angular/core';
import {injectLocalStorage} from "ngxtension/inject-local-storage";
import m from 'moment';
import set from "fast-path-set";
import {ulid} from 'ulid';
import {ApiService} from "../api/api.service";
import {Observable, of} from "rxjs";
import {linkedQueryParam} from "ngxtension/linked-query-param";
import { remove } from "lodash";

@Injectable({
	providedIn: 'root',
})
export class UtilService {

	private api: ApiService = inject(ApiService);
	public $domain = linkedQueryParam("domain");

	public m = m;

	public set = set;
	public assing = Object.assign;
	public remove = remove;

	constructor() {
		this.m.updateLocale('ja', {week: {dow: 1}});
	}

	find(array: any[],): any {

	}

	ulid(): string {
		return ulid().toLowerCase();
	}

	uid(): Observable<string> {
		return of(this.ulid());
	}

}
