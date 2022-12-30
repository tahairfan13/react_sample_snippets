import { Box, useTheme } from '@mui/material';
import { Metric } from 'hooks/react-query/useMetricDetails';
import { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';

interface Props {
  type: Metric | undefined;
  animationTracker: {
    cardPositionName: string;
    mouseOver: boolean;
    trialType: number;
  };
  sizing: {
    width: string;
    height: string;
    viewBox: string;
  };
  path: string;
}

const LeaderLine: React.FC<Props> = ({
  type,
  animationTracker,
  sizing,
  path,
}) => {
  const theme = useTheme();
  const strokeLength = 14;

  // Determine whether the leader line should be animating or not
  const [animationToggle, setAnimationToggle] = useState(true);
  useEffect(() => {
    const shouldAnimate =
      type?.cardPositionName === animationTracker.cardPositionName &&
      animationTracker.mouseOver;
    setAnimationToggle(!shouldAnimate);
  }, [animationTracker, type]);

  // Determine whether the trial is physical or cognitive
  const isPhysicalTrial = animationTracker.trialType === 1;

  // Animate the leader line color based on whether the trial is physical or cognitive
  const leaderLineColor = useSpring({
    stroke: animationToggle
      ? theme.palette.leaderLine.default
      : isPhysicalTrial
      ? theme.palette.leaderLine.physical
      : theme.palette.leaderLine.cognitive,
    config: { duration: 500 },
  });

  // Animate the leader line into dashes
  const dashArray = useSpring({
    from: { strokeDasharray: animationToggle ? strokeLength : 0 },
    to: {
      strokeDasharray: animationToggle ? 0 : strokeLength,
      strokeWidth: animationToggle ? 1 : 3,
    },
    config: { duration: 500 },
  });

  // Animate the dashes towards the 3D avatar
  const dashOffset = useSpring({
    from: { strokeDashoffset: strokeLength * 2 },
    to: { strokeDashoffset: 0 },
    config: {
      duration: 500,
      easing: (t) => t,
    },
    loop: true,
  });

  // Combine all the animations into a single style object
  const pathStyle = animationToggle
    ? leaderLineColor
    : {
        ...dashArray,
        ...leaderLineColor,
        ...dashOffset,
      };

  return (
    <Box
      component={'svg'}
      sx={{
        '& path': { strokeDasharray: 0, strokeDashoffset: 0 },
        ...sizing,
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
      }}
    >
      <animated.path
        style={pathStyle}
        d={path}
        stroke={theme.palette.leaderLine.default}
      />
    </Box>
  );
};

export default LeaderLine;
