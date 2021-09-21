import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GoogleAddress } from '../model/address';
import { GoogleAddressService } from '../service/google-address.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  showDetails = false;
  @Input() addressType: string;
  place!: object;
  @ViewChild('addresstext') addresstext: any;
  
  establishmentAddress: Object;

  formattedAddress: string;
  formattedEstablishmentAddress: string;

  addressForm!: FormGroup;
  googleAddress!: GoogleAddress;

  constructor(private googleAddressService: GoogleAddressService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initializeAddressForm();
  }

  initializeAddressForm() {
    const initialAddress : GoogleAddress =  {
      addressLine1: '', addressLine2: '', city: '' , state: '', country: '', postalCode: ''
    };
    this.googleAddress = initialAddress;

    this.addressForm = this.formBuilder.group({
      addressLine1: new FormControl(this.googleAddress.addressLine1, [Validators.required,
      Validators.maxLength(200)]),
      addressLine2: new FormControl(this.googleAddress.addressLine2),
      city: new FormControl(this.googleAddress.city, [Validators.required,
      Validators.maxLength(100)]),
      state: new FormControl(this.googleAddress?.state, [Validators.required,
      Validators.maxLength(50)]),
      postalCode: new FormControl(this.googleAddress.postalCode, [Validators.required,
      Validators.maxLength(15)]),
      country: new FormControl(this.googleAddress?.country, [Validators.required,
      Validators.maxLength(50)])
    });
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.addresstext.nativeElement,
      {
        componentRestrictions: { country: 'US' },
        types: [this.addressType]  // 'establishment' / 'address' / 'geocode' // we are checking all types
      }
    );
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.place = autocomplete.getPlace();
      this.formattedAddress = this.googleAddressService.getFormattedAddress(this.place);
      this.patchGoogleAddress();
      this.showDetails = true;
    });
  }

  patchGoogleAddress() {
    const streetNo = this.googleAddressService.getStreetNumber(this.place);
    const street = this.googleAddressService.getStreet(this.place);
    let googleAddress: GoogleAddress = {
      addressLine1: `${streetNo === undefined ? '' : streetNo} ${street === undefined ? '' : street
        }`,
      addressLine2: '',
      postalCode: this.googleAddressService.getPostCode(this.place),
      city: this.googleAddressService.getLocality(this.place),
      state: this.googleAddressService.getState(this.place),
      country: this.googleAddressService.getCountryShort(this.place),
    };
    this.addressForm.markAllAsTouched();
    this.patchAddress(googleAddress);
  }

  patchAddress(address: GoogleAddress) {
    if (this.addressForm !== undefined) {
      this.addressForm
        .get('addressLine1')!
        .patchValue(address.addressLine1);
      this.addressForm
        .get('addressLine2')!
        .patchValue(address.addressLine2);
      this.addressForm.get('postalCode')!.patchValue(address.postalCode);
      this.addressForm.get('city')!.patchValue(address.city);
      this.addressForm.get('state')!.patchValue(address.state);
      this.addressForm.get('country')!.patchValue(address.country);
    }
  }


}
