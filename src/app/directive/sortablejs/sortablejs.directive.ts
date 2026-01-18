import {AfterViewInit, ChangeDetectorRef, Directive, ElementRef, inject, input, OnDestroy, output} from '@angular/core';
import Sortable, {Options, SortableEvent} from 'sortablejs';

@Directive({
	standalone: true,
	selector: '[appSortablejs]',
})
export class SortablejsDirective implements AfterViewInit, OnDestroy {
	private el = inject(ElementRef);
	private cdr = inject(ChangeDetectorRef);
	private sortable?: Sortable;

	list = input.required<Array<{ sort: number }>>();
	options = input<Options>({handle: '.handle'});
	onUpdate = output<void>();

	ngAfterViewInit(): void {
		const list = this.list();
		const options = this.options();

		this.sortable = new Sortable(this.el.nativeElement, {
			...options,
			onUpdate: (e: SortableEvent) => {
				const {oldIndex, newIndex} = e;
				if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
					const [moved] = list.splice(oldIndex, 1);
					list.splice(newIndex, 0, moved);
					let sort = Date.now();
					list.forEach((v) => v.sort = sort--);

					this.cdr.detectChanges(); // 強制的に変更検知
					this.onUpdate.emit();
				}
			}
		});
	}

	ngOnDestroy() {
		this.sortable?.destroy();
	}
}
