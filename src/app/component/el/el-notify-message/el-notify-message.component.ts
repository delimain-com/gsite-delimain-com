import {Component, inject} from '@angular/core';
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";

@Component({
	selector: 'app-el-notify-message',
	imports: [],
	templateUrl: './el-notify-message.component.html',
	styleUrl: './el-notify-message.component.scss',
})
export default class ElNotifyMessageComponent {

	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);

}
