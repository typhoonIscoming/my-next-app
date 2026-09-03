'use client';
import SvgIcon from '@mui/material/SvgIcon';
import ArrowDown from '@/app/assets/svgs/arrow-narrow-down-svgrepo-com.svg';

type CustomSvgIconProps = {
	inheritViewBox?: boolean;
	[key: string]: any;
};

export function ArrowDownSvgIcon({ inheritViewBox = true, ...rest }: CustomSvgIconProps) {
	return <SvgIcon {...rest} component={ArrowDown} inheritViewBox={inheritViewBox} />;
}
