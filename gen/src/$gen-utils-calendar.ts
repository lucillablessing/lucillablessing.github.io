// ## Imports

import {
	type DateTuple,
	type Calendar,
} from "../../scripts/ts/utils.ts";

import {
	padPrefix,
} from "./$gen-utils.ts";



// ## Constants

const gregorianMonthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

const blessingMonthNames = [
	// The Blessing calendar year actually starts in September/Starbirth,
	// but these names are aligned with the Gregorian ones to make conversion
	// easier.
	"Heaven's Gift",  // January
	"Zenith Nights",  // February
	"Spring Dream",   // March
	"Healer's Cleft", // April
	"Maybe Might",    // May
	"Honeymonth",     // June
	"Summer Rainbow", // July
	"Skybirth",       // August
	"Starbirth",      // September
	"Love's Dawn",    // October
	"Amber Sunrise",  // November
	"Winter's Heart", // December
] as const;



// ## Functions

function formatDate(
	date: DateTuple, calendar: Calendar
): string {
	let [year, month, day] = date;
	switch (calendar) {
		case "gregorian": {
			const gOrdinal = formatOrdinal(day, "gregorian");
			const gMonthName = gregorianMonthNames[month - 1];
			return `${gMonthName} ${day}${gOrdinal}, ${year}`;
		}
		case "blessing": {
			// The last day of every month is retconned as the "zeroth" day of
			// the next month. This is because the Blessing calendar is
			// zero-indexed, but as many dates as possible should line up.
			if (isLastDayOfMonth(date)) {
				day = 0;
				month = month === 12 ? 1 : month + 1;
			}
			// The Blessing year starts in September/Starbirth, and months
			// before that get recategorized into the previous year.
			if (month < 9) year--;
			const bOrdinal = formatOrdinal(day, "blessing");
			const bMonthName = blessingMonthNames[month - 1];
			return `${day}${bOrdinal} of ${bMonthName}, b${year}`;
		}
	}
}


function formatDateNumeric([year, month, day]: DateTuple): string {
	const yearString  = year.toString();
	const monthString = padPrefix(month.toString(), 2, "0");
	const dayString   = padPrefix(day.toString(),   2, "0");
	return `${yearString}-${monthString}-${dayString}`;
}


function formatOrdinal(n: number, calendar: Calendar): string {
	if (n < 10) {
		switch (calendar) {
			case "gregorian":
			switch (n) {
				case 0:  return "th"; // "0th" = "zeroth"
				case 1:  return "st"; // "1st" = "first"
				case 2:  return "nd"; // "2nd" = "second"
				case 3:  return "rd"; // "3rd" = "third"
				default: return "th";
			}
			case "blessing":
			switch (n) {
				case 0:  return "st"; // "0st" = "first"
				case 1:  return "nd"; // "1nd" = "second"
				case 2:  return "ld"; // "2ld" = "twild"
				case 3:  return "rd"; // "3rd" = "third"
				default: return "th";
			}
		}
	} else return (
		// If it's a "teen"...          ...or an exact ten,
		(n % 100 >= 10 && n % 100 < 20) || n % 10 === 0 ?
		// then return "th",
		"th" :
		// otherwise, return whatever suffix the ones digit would have.
		formatOrdinal(n % 10, calendar)
	);
}


function isLastDayOfMonth([year, month, day]: DateTuple): boolean {
	const monthIndex = month - 1;
	// Does adding 1 to the day cause the month to overflow?
	return monthIndex !== new Date(year, monthIndex, day + 1).getMonth();
}



// ## Exports

export {
	formatDate,
	formatDateNumeric,
}
