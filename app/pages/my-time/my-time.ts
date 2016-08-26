import {
    LoadingController, ModalController, AlertController, Refresher, NavController, Events
} from 'ionic-angular';
import {Component, OnInit} from '@angular/core';
import {Moment} from 'moment';

import {DateFormatPipe} from 'angular2-moment';
import {DurationPipe} from '../../pipes/duration-pipe';
import {OrderByPipe} from '../../pipes/order-by-pipe';

import {MyTimeService} from './my-time.service';
import {WorkingStep} from './working-step/working-step';
import {WorkingStepMoreModal} from '../../components/working-step-more/working-step-more-modal';
import {WorkingStepDetail} from './working-step-detail/working-step-detail';

import {CalendarView} from '../../components/calendar-view/calendar-view';


@Component({
    templateUrl: 'build/pages/my-time/my-time.html',
    styles: [
        `.month-or-week span{
            color: #8c8c8c;
        }
        .active{
            color: #387ef5;
        }

        `
    ],
    providers: [MyTimeService],
    pipes: [DateFormatPipe, DurationPipe, OrderByPipe],
    directives: [CalendarView]
})

export class MyTimePage implements OnInit {

    selectedDate: {from: Moment, to: Moment};
    workingSteps: Array<any> = [];
    totalSumOfWorkingSteps: number;
    firstLastDateOfWorkingSteps: {first: Moment, last: Moment};
    inclBooked: boolean = false;
    tenant: string = null;
    memberId: string = null;
    selectedDateClass: boolean = false;
    areWorkingStepsLoading: boolean = false;

    constructor(public events: Events, private nav: NavController,private loadingController: LoadingController, private alertController: AlertController, private modalCtrl: ModalController, private myTimeService: MyTimeService) {
    }

    gotToWorkingStepDetail(step) {
        this.nav.push(WorkingStepDetail, step);
    }

    createBooking() {
        let modal = this.modalCtrl.create(WorkingStep);
        modal.onDidDismiss((data)=> {
            if (data) {
                //TODO create function that add created working step to array on right position;
                // this.workingSteps.push(data);
                this.getWorkingSteps();
            }
        });
        modal.present();
    }

    openMoreModal() {
        let modal = this.modalCtrl.create(WorkingStepMoreModal, {
            inclBooked: this.inclBooked,
            selectedDate: this.selectedDate,
            totalSumOfWorkingSteps: this.totalSumOfWorkingSteps,
            firstLastDateOfWorkingSteps: this.firstLastDateOfWorkingSteps
        });
        modal.present();
        modal.onDidDismiss(data => {
            if (data && this.inclBooked !== data.inclBooked) {
                this.inclBooked = data.inclBooked;
                this.getWorkingSteps();
            }
        });
    }


    getWorkingSteps(refresher: Refresher = null) {
        this.areWorkingStepsLoading = refresher === null ? true : false;
        this.myTimeService.getWorkingSteps(this.selectedDate.from, this.selectedDate.to, this.inclBooked, this.memberId, this.tenant).subscribe(
            data => {
                this.workingSteps = data.list;
                this.totalSumOfWorkingSteps = data.totalSum;
                this.firstLastDateOfWorkingSteps = data.firstLast;
                this.areWorkingStepsLoading = false;
                refresher && refresher.complete();
            },
            error => {
                console.log(error);
                this.areWorkingStepsLoading = false;
                refresher && refresher.complete();
            }
        );
    }

    deleteWorkingStep(workingStep) {
        let loader = this.loadingController.create({
            content: 'Deleting...'
        });
        let prompt = this.alertController.create({
            title: 'Delete',
            message: "Do you really want to delete the Working Step",
            buttons: [
                {
                    text: 'No, I do not',
                    role: 'cancel',
                },
                {
                    text: 'Yes, I do',
                    handler: ()=> {
                        loader.present();
                        this.myTimeService.deleteWorkingStep(workingStep).subscribe(() => {
                            this.deleteWorkingStepLocally(workingStep);
                            loader.dismiss();
                        }, error=> {
                            loader.dismiss();
                            console.log(error);
                        });
                    }
                }
            ]
        });
        prompt.present();
    }

    editWorkingStep(step) {
        let modal = this.modalCtrl.create(WorkingStep, {workingStep: step});
        modal.onDidDismiss((data)=> {
            if (data) {
                //TODO create function that add edit working step to array on right position;
                // this.workingSteps.push(data);
                this.getWorkingSteps();
            }
        });
        modal.present();
    }

    private deleteWorkingStepLocally(workingStep) {
        this.workingSteps.forEach((item, index, array)=> {
            if (item.date === workingStep.date) {
                item.values.splice(item.values.findIndex((el)=> {
                    return el.id === workingStep.id;
                }), 1);
                if (item.values.length === 0) {
                    array.splice(index, 1);
                }
            }
        });
    }

    ngOnInit() {
        this.events.subscribe('workingSteps:refreshed', params => {
            this.selectedDate = params[0];
            this.getWorkingSteps();
        });
    }
}