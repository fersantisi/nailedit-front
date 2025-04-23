import { Typography } from '@mui/material';

interface HomeResourceItemTitleProps {
  title: string | number;
  fontSize: string;
}

export const HomeResourceItemTitle = ({ title, fontSize }: HomeResourceItemTitleProps) => {
  return (
    <Typography
      variant="h4"
      sx={{
        color: 'text.primary',
        fontSize: fontSize
      }}
    >
      {title}
    </Typography>
  );
};
