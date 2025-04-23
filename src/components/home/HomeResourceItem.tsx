import { Box } from "@mui/material";
import { HomeResourceItemTitle } from "./HomeResourceItemTitle";

interface HomeResourceItemProps {
  title: string;
  project: string;
  amount: string | number;
}

export const HomeResourceItem = ({ title, project, amount }: HomeResourceItemProps) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          justifySelf: 'center',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '30%',
        }}
      >
        <HomeResourceItemTitle title={title} fontSize="15px" />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          justifySelf: 'center',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '30%',
        }}
      >
        <HomeResourceItemTitle title={project} fontSize="15px" />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          justifySelf: 'center',
          alignItems: 'space-evenly',
          flexWrap: 'wrap',
          width: '30%',
        }}
      >
        <HomeResourceItemTitle title={amount} fontSize="15px" />
      </Box>
    </>
  );
};