export interface IUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	initials: string;
}

export interface IUpdateProfileRequest {
	firstName: string;
	lastName: string;
	email: string;
}
