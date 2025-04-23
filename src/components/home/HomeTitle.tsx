import { Typography } from '@mui/material';

interface HomeTitleProps {
  title: string;
  fontSize: string;
}

export const HomeTitle = ({ title, fontSize }: HomeTitleProps) => {
  return (
    <Typography
      variant="h4"
      sx={{
        color: 'text.primary',
        fontSize: fontSize,
        fontWeight: 'bold',
        pl: '20px',
        pt: '15px',
      }}
    >
      {title}
    </Typography>
  );
};
