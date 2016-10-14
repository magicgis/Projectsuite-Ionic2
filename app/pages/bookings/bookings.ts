import {
    LoadingController, ModalController, AlertController, Refresher, NavController, Content
} from 'ionic-angular';
import {ViewChild, Component} from '@angular/core';
import {Moment} from 'moment';

import {DateFormatPipe} from 'angular2-moment';
import {DurationPipe} from '../../pipes/duration-pipe';
import {OrderByPipe} from '../../pipes/order-by-pipe';

// import {MyTimeService} from './my-time.service';
// import {WorkingStep} from './working-step/working-step';
import {BookingMore} from '../../components/booking-more/booking-more';
import {BookingDetail} from '../my-time/booking-detail/booking-detail';
import {CalendarView} from '../../components/calendar-view/calendar-view';
import {Booking} from  '../../models/booking';

@Component({
    templateUrl: 'build/pages/bookings/bookings.html',
    pipes: [DateFormatPipe, DurationPipe, OrderByPipe],
    directives: [CalendarView],
})
export class BookingsPage {

    selectedDate: {from: Moment, to: Moment};
    bookings: Array<Booking> = [];
    bookingsMore: {inclBooked: boolean,totalSumOfBookings: number,datesOfBookingsView: {first: Moment,last: Moment}}
    isLoading:boolean = false;
    bookingsLabel:string = 'Working Steps'

    constructor(private navCtrl: NavController, private loadingCtrl: LoadingController, private alertCtrl: AlertController, private modalCtrl: ModalController) {

    }

    gotToBookingDetail(booking) {
        this.navCtrl.push(BookingDetail, booking);
    }

    openMoreModal() {
        let modal = this.modalCtrl.create(BookingMore, {
            inclBooked: this.bookingsMore.inclBooked,
            selectedDate: this.selectedDate,
            totalSumOfBookings: this.bookingsMore.totalSumOfBookings,
            datesOfBookingsView: this.bookingsMore.datesOfBookingsView,
            bookingsLabel: this.bookingsLabel
        });
        modal.present();
        modal.onDidDismiss(data => {
            if (this.bookingsMore.inclBooked !== data.inclBooked) {
                this.bookingsMore.inclBooked = data.inclBooked;
                this.getBookings();
            }
        });
    }

    callGetBookings(selectedDate) {
        this.selectedDate = selectedDate;
        this.getBookings();
    }

    getBookings(refresher: Refresher = null) {
        this.isLoading = refresher === null ? true : false;
        this.myTimeService.getWorkingSteps(this.selectedDate.from, this.selectedDate.to, this.inclBooked, this.memberId, this.tenant).subscribe(
            data => {
                this.bookings = data.list;
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

}
