import {Component, DestroyRef, inject, output, signal, WritableSignal} from '@angular/core';
import {JsonPipe} from "@angular/common";
import {SortablejsModule} from "nxt-sortablejs";
import {Options} from "sortablejs";
import {NotifyMessageService} from "../../../../service/notify-message/notify-message.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {take, tap} from "rxjs";
import {ApiService} from "../../../../service/api/api.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
	selector: 'app-cast-section-list-sort',
	imports: [
		JsonPipe,
		SortablejsModule
	],
	templateUrl: './cast-section-list-sort.component.html',
	styleUrl: './cast-section-list-sort.component.scss',
	host: {class: 'h-100'}
})
export default class CastSectionListSortComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private api: ApiService = inject(ApiService);

	private activeModal: NgbActiveModal = inject(NgbActiveModal);

	private notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	$select_castSectionItem: WritableSignal<any> = signal({});

	$castSectionList: WritableSignal<any> = signal([]);

	castSectionListSortableOptions: Options = {
		handle: '.handle',
		onUpdate: () => {
			const castSectionList = this.$castSectionList() || [];
			const params: any = {};
			{
				let sort = Date.now();
				params.castSectionList = castSectionList.map((castSection: any) => {
					return {
						...castSection,
						sort: sort--
					};
				});
				this.notifyMessage.show('保存中...');
				this.api.post('page/castList/save_castSectionList', params)
					.pipe(
						takeUntilDestroyed(this.#DestroyRef),
						tap(() => {
							this.$castSectionList.set(params.castSectionList);
							this.notifyMessage.hide('保存しました');
						}),
						take(1)
					)
					.subscribe();
			}
		}
	};

	action_close(): void {
		this.activeModal.close();
	}
}
