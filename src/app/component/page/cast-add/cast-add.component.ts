import {Component, DestroyRef, inject} from '@angular/core';
import {ApiService} from "../../../service/api/api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {take, tap} from "rxjs";
import {UtilService} from "../../../service/util/util.service";
import {SessionService} from "../../../service/session/session.service";
import {NavigationService} from "../../../service/navigation/navigation.service";

@Component({
	selector: 'app-cast-add',
	imports: [],
	templateUrl: './cast-add.component.html',
	styleUrl: './cast-add.component.scss',
})
export default class CastAddComponent {

	private navigation: NavigationService = inject(NavigationService);

	constructor() {
		this.navigation.navigateWithContext('castEdit')
			.subscribe();
	}

}
