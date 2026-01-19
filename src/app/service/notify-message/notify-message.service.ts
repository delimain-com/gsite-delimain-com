import {DestroyRef, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {injectNavigationEnd} from "ngxtension/navigation-end";
import {tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable({
	providedIn: 'root',
})
export class NotifyMessageService {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public $isMessage: WritableSignal<boolean> = signal(false);
	public $text: WritableSignal<string> = signal('');
	public $timer: WritableSignal<any> = signal(undefined);

	constructor() {
	}

	message(text: string, ms: number = 1000) {
		this.$timer() && clearTimeout(this.$timer());
		this.$isMessage.set(true);
		this.$text.set(text);
		this.$timer.set(setTimeout(() => {
			this.$isMessage.set(false);
			this.$text.set('');
		}, ms));
	}

	show(text: string): void {
		this.message(text, 1000 * 60 * 60);
	}

	hide(text: string): void {
		this.message(text, 1000);
	}

	close(): void {
		this.$timer() && clearTimeout(this.$timer());
		this.$text.set('');
	}
}
