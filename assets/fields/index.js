import TextField from './TextField';
import UrlField from './UrlField';
import EmailField from './EmailField';
import NumberField from './NumberField';
import TitleField from './TitleField';
import TelField from './TelField';
import PasswordField from './PasswordField';
import ColorField from './ColorField';
import DatetimeField from './DatetimeField';
import MonthField from './MonthField';
import DateField from './DateField';
import TimeField from './TimeField';
import WeekField from './WeekField';
import TextareaField from './TextareaField';
import HtmlField from './HtmlField';
import GroupField from './GroupField';
import MultiGroupField from './MultiGroupField';
import CheckboxField from './CheckboxField';
import ToggleField from './ToggleField';
import SelectField from './SelectField';
import MultiSelectField from './MultiSelectField';
import CodeField from './CodeField';
import PostField from './PostField';
import MultiPostField from './MultiPostField';
import AttachmentField from './AttachmentField';
import MultiAttachmentField from './MultiAttachmentField';
import MultiToggleField from './MultiToggleField';
import ButtonField from './ButtonField';
import ReactField from './ReactField';
import SeparatorField from './SeparatorField';

export const fields = {
	text: TextField,
	url: UrlField,
	email: EmailField,
	number: NumberField,
	title: TitleField,
	tel: TelField,
	password: PasswordField,
	color: ColorField,
	datetime: DatetimeField,
	month: MonthField,
	date: DateField,
	time: TimeField,
	week: WeekField,
	textarea: TextareaField,
	html: HtmlField,
	group: GroupField,
	multi_group: MultiGroupField,
	checkbox: CheckboxField,
	toggle: ToggleField,
	select: SelectField,
	multi_select: MultiSelectField,
	code: CodeField,
	post: PostField,
	multi_post: MultiPostField,
	attachment: AttachmentField,
	multi_attachment: MultiAttachmentField,
	multi_toggle: MultiToggleField,
	button: ButtonField,
	react: ReactField,
	separator: SeparatorField,
};