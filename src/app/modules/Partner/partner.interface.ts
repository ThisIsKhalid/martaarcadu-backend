type TAvailableTime = {
  availableTimeStart: string;
  availableTimeEnd: string;
};

export interface IPartner {
  profilePhoto: string;
  title: string;
  pricePerConsultation: number;
  availableDayStart: string;
  availableDayEnd: string;
  availableTime: TAvailableTime[];
  userId: string;
}
