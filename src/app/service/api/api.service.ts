import {inject, Injectable, resource, ResourceRef} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, firstValueFrom, map, Observable, of, tap} from "rxjs";
import {environment} from "../../../environments/environment";
import {SessionService} from "../session/session.service";
import {linkedQueryParam} from "ngxtension/linked-query-param";
import set from "fast-path-set";

@Injectable({
	providedIn: 'root',
})
export class ApiService {

	private http: HttpClient = inject(HttpClient);

	private session: SessionService = inject(SessionService);
	private $session = this.session.$session;
	public $domain = linkedQueryParam("domain");

	post(path: string = '', params: any = {}, conf: any = {ignore_auth: false}): Observable<any> {
		const url = `${environment.endpoint}/${path}`;
		params || (params = {});
		if (!conf.ignore_auth) {
			const {auth} = this.$session() || {};
			params.auth = auth;
		}
		{
			const domain = this.$domain();
			domain && set(params, 'data.site.domain', domain);
		}
		return this.http.post(url, params)
			.pipe(
				tap((r: any) => {
					const status = r.status;
					if ('AUTH_FAILED' === status) {
						this.$session.set(null);
					}
				}),
				map((r: any = {}) => {
					r.results || (r.results = {});
					return r;
				}),
				catchError((httpErrorResponse: HttpErrorResponse, o: any) => {
					return of({
						httpErrorResponse,
						o: o,
						results: {}
					});
				})
			);
	}

	$post<T = any>(path: string = '', params: any = {}, conf: any = {ignore_auth: false}): ResourceRef<T | undefined> {
		return resource({
			// v21では 'request' ではなく 'params' です
			params: () => ({path, params, conf}),

			// loader の引数も { params } でデストラクトします
			loader: async ({params: p, abortSignal}) => {
				// 既存の post メソッドへ委譲
				const obs$ = this.post(p.path, p.params, p.conf);

				// v21のドキュメント通り Promise (firstValueFrom) で返します
				// abortSignal を使ってリクエストの中断にも対応可能です
				return await firstValueFrom(obs$);
			}
		});
	}

	uid(): Observable<string> {
		const params = {};
		const conf = {ignore_auth: true};
		return this.post('fn/util/uid', params, conf)
			.pipe(map(({results}) => results?.uid));
	}
}
