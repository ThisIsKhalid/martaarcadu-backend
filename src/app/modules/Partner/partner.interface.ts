type TAvailableTime = {
  availableTimeStart: string;
  availableTimeEnd: string;
};

export interface Partner {
  profilePhoto: string;
  title: string;
  pricePerConsultation: number;
  availableDayStart: string;
  availableDayEnd: string;
  availableTime: TAvailableTime[];
  userEmail: string;
}
