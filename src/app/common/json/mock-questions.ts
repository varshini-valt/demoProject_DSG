export const mockPPQuestionsResponse: any = {
  wir_counsellor_team: 'DEMO_TEAM',
  items: [
    {
      fields: {
        questions: [
          {
            mappingField: 'title',
            label: 'Your details',
            displayFormat: { value: 'LABEL' }
          },
          {
            mappingField: 'first_name',
            label: 'First name',
            helpText: 'Please enter your first name',
            defaultValue: '',
            displayFormat: { value: 'TEXT_BOX' }
          },
          {
            mappingField: 'last_name',
            label: 'Last name',
            helpText: 'Please enter your last name',
            defaultValue: '',
            displayFormat: { value: 'TEXT_BOX' }
          },
          {
            mappingField: 'primary_email',
            label: 'Email address',
            helpText: 'Please enter a valid email address',
            defaultValue: 'example@email.com',
            displayFormat: { value: 'TEXT_BOX' }
          },
          {
            mappingField: 'password',
            label: 'Password',
            helpText: 'Please enter your password',
            defaultValue: '',
            displayFormat: { value: 'TEXT_BOX' }
          },
          {
            mappingField: 'newPassword',
            label: 'New password',
            helpText: 'Please enter a new password',
            defaultValue: '',
            displayFormat: { value: 'TEXT_BOX' }
          },
          {
            mappingField: 'confirmPassword',
            label: 'Confirm new password',
            helpText: 'Please confirm your new password',
            defaultValue: '',
            displayFormat: { value: 'TEXT_BOX' }
          },
          {
            mappingField: 'dialCode',
            label: 'Code',
            helpText: 'Please select a dial code',
            defaultValue: '+91',
            minLength: 10,
            maxLength: 10,
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: '+91', option_value: '+91', dialCode: '+91', minLength: 10, maxLength: 10 },
              { option_label: '+1', option_value: '+1', dialCode: '+1', minLength: 10, maxLength: 10 },
              { option_label: '+44', option_value: '+44', dialCode: '+44', minLength: 10, maxLength: 11 },
              { option_label: '+61', option_value: '+61', dialCode: '+61', minLength: 9, maxLength: 9 },
              { option_label: '+64', option_value: '+64', dialCode: '+64', minLength: 9, maxLength: 10 }
            ]
          },
          {
            mappingField: 'primary_mobile_number',
            label: 'Mobile number',
            helpText: 'Please enter your mobile number',
            defaultValue: '',
            minLength: 10,
            maxLength: 10,
            displayFormat: { value: 'TEXT_BOX' }
          },
          {
            mappingField: 'date_of_birth',
            label: 'Date of birth',
            helpText: 'Please enter your date of birth',
            defaultValue: '',
            displayFormat: { value: 'DATE_PICKER' }
          },
          {
            mappingField: 'gender',
            label: 'Gender',
            helpText: 'Please select your gender',
            defaultValue: '',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Male', option_value: 'Male' },
              { option_label: 'Female', option_value: 'Female' },
              { option_label: 'Non-Binary', option_value: 'Non-Binary' },
              { option_label: 'Prefer not to say', option_value: 'Prefer not to say' }
            ]
          },
          {
            mappingField: 'passport',
            label: 'Do you have a valid passport?',
            helpText: 'Please select an option',
            defaultValue: '',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Yes', option_value: 'Yes' },
              { option_label: 'No', option_value: 'No' },
              { option_label: 'Applied', option_value: 'Applied' }
            ]
          },
          {
            mappingField: 'nationalityCode',
            label: 'Nationality',
            helpText: 'Please select your nationality',
            defaultValue: 'Select your nationality',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Indian', option_value: 'IN' },
              { option_label: 'Australian', option_value: 'AU' },
              { option_label: 'American', option_value: 'US' },
              { option_label: 'British', option_value: 'GB' },
              { option_label: 'Canadian', option_value: 'CA' },
              { option_label: 'Chinese', option_value: 'CN' },
              { option_label: 'Nepalese', option_value: 'NP' },
              { option_label: 'Sri Lankan', option_value: 'LK' },
              { option_label: 'Bangladeshi', option_value: 'BD' }
            ]
          },
          {
            mappingField: 'preferredCountryCode',
            label: 'Preferred study destination',
            helpText: 'Please select your preferred study destination',
            defaultValue: '',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Australia', option_value: 'AU' },
              { option_label: 'United Kingdom', option_value: 'GB' },
              { option_label: 'Canada', option_value: 'CA' },
              { option_label: 'New Zealand', option_value: 'NZ' },
              { option_label: 'United States', option_value: 'US' },
              { option_label: 'Ireland', option_value: 'IE' }
            ]
          },
          {
            mappingField: 'preferredStudyLevel',
            label: 'Preferred study level',
            helpText: 'Please select your preferred study level',
            defaultValue: '',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Undergraduate', option_value: 'Undergraduate' },
              { option_label: 'Postgraduate', option_value: 'Postgraduate' },
              { option_label: 'Doctorate', option_value: 'Doctorate' },
              { option_label: 'Vocational', option_value: 'Vocational' },
              { option_label: 'English Language', option_value: 'English Language' }
            ]
          },

          {
            mappingField: 'maritalStatus',
            label: 'Marital status',
            helpText: 'Please select your marital status',
            defaultValue: 'Select your marital status',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Single', option_value: 'Single' },
              { option_label: 'Married', option_value: 'Married' },
              { option_label: 'Prefer not to say', option_value: 'Prefer not to say' }
            ]
          },
          {
            mappingField: 'studyPlanTimeline',
            label: 'When do you plan to start studying?',
            helpText: 'Please select your planned study date',
            defaultValue: 'Select your planned start date',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Jan 2025', option_value: 'Jan 2025' },
              { option_label: 'Jul 2025', option_value: 'Jul 2025' },
              { option_label: 'Jan 2026', option_value: 'Jan 2026' },
              { option_label: 'Jul 2026', option_value: 'Jul 2026' },
              { option_label: 'Not sure yet', option_value: 'Not sure yet' }
            ]
          },
          {
            mappingField: 'primaryFinancialSource',
            label: 'How will you fund your studies?',
            helpText: 'Please select your primary financial source',
            defaultValue: 'Select one option',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Self-funded', option_value: 'Self-funded' },
              { option_label: 'Family', option_value: 'Family' },
              { option_label: 'Scholarship', option_value: 'Scholarship' },
              { option_label: 'Education loan', option_value: 'Education loan' },
              { option_label: 'Employer sponsored', option_value: 'Employer sponsored' }
            ]
          },
          {
            mappingField: 'howDidYouHear',
            label: 'How did you hear about DSG?',
            helpText: 'Please select an option',
            defaultValue: 'Select one option',
            displayFormat: { value: 'SELECT_BOX' },
            options: [
              { option_label: 'Social media', option_value: 'Social media' },
              { option_label: 'Search engine', option_value: 'Search engine' },
              { option_label: 'Friend or family', option_value: 'Friend or family' },
              { option_label: 'Education fair', option_value: 'Education fair' },
              { option_label: 'Advertisement', option_value: 'Advertisement' },
              { option_label: 'Other', option_value: 'Other' }
            ]
          },
          {
            mappingField: 'termsAndConditionsAcceptance',
            label: "I agree to the TERMS_LINK_HREFTerms and ConditionsLINK_ATAG and PRIVACY_LINK_HREFPrivacy PolicyLINK_ATAG",
            helpText: 'Please accept the terms and conditions',
            defaultValue: '',
            displayFormat: { value: 'CHECKBOX' },
            termsURL: 'https://www.example.com/terms/',
            privacyURL: 'https://www.example.com/privacy/'
          },
          {
            mappingField: 'contactMeBy',
            label: 'I agree to be contacted by DSG',
            helpText: 'Please accept to continue',
            defaultValue: '',
            displayFormat: { value: 'CHECKBOX' }
          },
          {
            mappingField: 'marketing_acceptance_flag.acceptPhoneCall, marketing_acceptance_flag.acceptEmail, marketing_acceptance_flag.acceptSms',
            label: 'I would like to receive marketing communications from DSG',
            helpText: '',
            defaultValue: '',
            displayFormat: { value: 'CHECKBOX' }
          }
        ]
      }
    }
  ]
}
