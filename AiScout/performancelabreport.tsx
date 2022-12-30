import { Box, useTheme } from '@mui/material';
import Image from 'components/Image';
import LeaderLines from 'components/LeaderLines/Index';
import MetricCard from 'components/MetricCard';
import MetricDetails from 'components/MetricDetails';
import { getDesktopMetricPositions } from 'components/PerformanceLabReport/MetricsPosition';
import MobileMetrics from 'components/PerformanceLabReport/MobileMetrics';
import Person from 'components/PerformanceLabReport/Person';
import PlayerTeam from 'components/PerformanceLabReport/PlayerTeam';
import ReportChart from 'components/ReportChart';
import ReportTitle from 'components/ReportTitle';
import Spinner from 'components/UI/Spinner';
import UserSessionProvider from 'components/UserSessionProvider';
import { useMetricDetails } from 'hooks/react-query/useMetricDetails';
import React from 'react';
import { useRecoilState } from 'recoil';
import { popperState, showDetailedMetric } from 'state/atoms';

const LabReport = () => {
  const [showDetails, setShowDetails] = useRecoilState(showDetailedMetric);
  const { status, data: metricDetail } = useMetricDetails();
  const [showPopperState] = useRecoilState(popperState);
  const [mouseOver, setMouseOver] = React.useState({
    cardPositionName: '',
    mouseOver: false,
    trialType: 1,
  });

  const theme = useTheme();

  const positionStyles = getDesktopMetricPositions(theme);

  let type1: Array<number> = [];
  let type2: Array<number> = [];

  const flteredEmptyMetrics = metricDetail?.data.report.metrics.filter(
    (arr) => {
      return arr.ratings.rating;
    }
  );

  flteredEmptyMetrics?.forEach((metric, i: number) => {
    if (metric.trialType === 2) {
      type1[i] = (metric.ratings.rating / metric.ratings.maxRating) * 10;
    } else {
      type2[i] = (metric.ratings.rating / metric.ratings.maxRating) * 10;
    }
  });

  // Omitting the empty elements
  const trialType1 = type1.filter((element: any) => {
    if (element.length !== 0) {
      return true;
    } else {
      return false;
    }
  });
  const trialType2 = type2.filter((element: any) => {
    if (element.length !== 0) {
      return true;
    } else {
      return false;
    }
  });
  // For calculating the average of the percentages array

  const average = (arr: Array<number>) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  // Rounding off...

  const average1 = parseFloat(average(trialType1).toFixed(1)) || 0;
  const average2 = parseFloat(average(trialType2).toFixed(1)) || 0;

  return (
    <UserSessionProvider allowUnauthenticated>
      <MetricDetails />
      <Box
        sx={(theme) => ({
          background: `url(${process.env.NEXT_PUBLIC_BASE_PATH}/images/labReport/bg-pattern.png), #051621`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover !important',
          overflow: 'hidden',
          height: '100vh',
          width: '100%',
          [theme.breakpoints.down('lg')]: {
            background: `url(${process.env.NEXT_PUBLIC_BASE_PATH}/images/labReport/bg.png), #051621`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover !important',
            overflow: 'hidden',
          },
        })}
      >
        {status === 'loading' ? (
          <Spinner>Loading Report...</Spinner>
        ) : (
          <>
            {showDetails.open && (
              <Box
                sx={{
                  zIndex: 101,
                  position: 'absolute',
                  width: '100%',
                  height: '100vh',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
                onClick={() => {
                  setShowDetails({
                    ...showDetails,
                    open: !showDetails.open,
                  });
                }}
              ></Box>
            )}
            {showPopperState && (
              <Box
                sx={{
                  zIndex: 1000,
                  position: 'absolute',
                  width: '100%',
                  height: '100vh',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              ></Box>
            )}
            {/* Name, team and date */}
            <ReportTitle metricDetail={metricDetail?.data} />
            {/* Overall Performance radial chart */}
            <ReportChart cognitive={average1} physical={average2} />
            <PlayerTeam team={metricDetail?.data.report.player.team} />
            <Box
              sx={(theme) => ({
                position: 'fixed',
                right: '30px',
                bottom: '8px',
                width: '164px',
                height: '64px',
                [theme.breakpoints.down('sm')]: {
                  right: '20px',
                  top: '30px',
                  width: '134px',
                  height: '44px',
                },
              })}
            >
              <Image
                src="/images/labReport/aiscout-logo.png"
                layout="fill"
                objectFit="contain"
                alt="aiLogo"
              />
            </Box>
            <Box
              sx={(theme) => ({
                position: 'fixed',
                right: '-80px',
                top: '133px',
                width: '238px',
                height: '84.36px',
                [theme.breakpoints.down('lg')]: {
                  display: 'none',
                },
              })}
            >
              <Image
                src="/images/labReport/rightSignal.png"
                layout="fill"
                objectFit="contain"
                alt="illustration"
              />
            </Box>
            <Box
              sx={{
                position: 'fixed',
                right: '30px',
                top: '30px',
                cursor: 'pointer',
                [theme.breakpoints.down('sm')]: {
                  display: 'none',
                },
              }}
            >
              <Image
                src="/images/labReport/aiLogo.svg"
                width="64"
                height="64"
                alt="aiLogo"
              />
            </Box>
            <Box
              sx={(theme) => ({
                position: 'fixed',
                right: '33px',
                bottom: '111px',
                width: '24px',
                height: '24px',
                [theme.breakpoints.down('lg')]: {
                  display: 'none',
                },
              })}
            >
              <Image
                src="/images/labReport/plus.png"
                layout="fill"
                objectFit="contain"
                alt="plus"
              />
            </Box>
            <Box
              sx={(theme) => ({
                position: 'fixed',
                left: '33px',
                bottom: '156px',
                width: '24px',
                height: '24px',
                [theme.breakpoints.down('lg')]: {
                  display: 'none',
                },
              })}
            >
              <Image
                src="/images/labReport/plus.png"
                layout="fill"
                objectFit="contain"
                alt="plus"
              />
            </Box>
            <Box
              sx={(theme) => ({
                position: 'fixed',
                left: '-80px',
                bottom: '198px',
                width: '238px',
                height: '84.36px',
                [theme.breakpoints.down('lg')]: {
                  display: 'none',
                },
              })}
            >
              <Image
                src="/images/labReport/leftSignal.png"
                layout="fill"
                objectFit="contain"
                alt="illustration"
              />
            </Box>
            <Box
              sx={(theme) => ({
                position: 'relative',
                overflow: 'hidden',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(0.9)',
                width: '1920px',
                height: '1020px',
                marginTop: '-121px',
                [theme.breakpoints.down('xxl')]: {
                  transform: 'translate(-50%, -50%) scale(0.87)',
                },
                ['@media (max-height:1020px)']: {
                  transform: 'transform: translate(-50%, -50%) scale(0.85)',
                },
                [theme.breakpoints.down(1600)]: {
                  transform: 'translate(-50%, -50%) scale(0.77)',
                },
                [theme.breakpoints.down(1420)]: {
                  transform: 'translate(-50%, -50%) scale(0.69)',
                },
                ['@media (max-height:1050px)']: {
                  transform: 'translate(-50%, -50%) scale(0.8.5)',
                },
                ['@media (max-height:970px)']: {
                  transform: 'translate(-50%, -50%) scale(0.75)',
                },
                ['@media (max-height:850px)']: {
                  transform: 'translate(-50%, -50%) scale(0.7)',
                },
                [theme.breakpoints.down(1350)]: {
                  transform: 'translate(-50%, -50%) scale(0.6)',
                },
                [theme.breakpoints.down(1490)]: {
                  transform: 'translate(-50%, -50%) scale(0.6)',
                },
                ['@media (max-height:845px)']: {
                  top: '53%',
                },
                ['@media (max-height:785px)']: {
                  top: '55%',
                },
                ['@media (max-height:765px)']: {
                  transform: 'translate(-50%, -50%) scale(0.6)',
                },
                [(theme.breakpoints.down('lg'), '@media (max-height:786px)')]: {
                  transform: 'translate(-50%, -50%) scale(0.5)',
                },
                ['@media (max-height:755px)']: {
                  transform: 'translate(-50%, -50%) scale(0.45)',
                },
                [theme.breakpoints.down('lg')]: {
                  top: '42%',
                },
              })}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '45%',
                  transform: 'translate(-50%, -50%)',
                  width: '550px',
                  height: '1000px',
                  marginRight: 'auto',
                  marginLeft: 'auto',
                  '& img': {
                    zIndex: '-2 !important',
                  },
                }}
              >
                <Person gender={metricDetail?.data.report.player.gender} />

                {metricDetail?.data.report.metrics && (
                  // Its major purpose is to show mobile metrics with man and popper functionality, We can change it's name if needed in next meeting
                  <MobileMetrics metrics={metricDetail?.data.report.metrics} />
                )}
              </Box>

              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  left: '50%',
                  top: '47%',
                  transform: 'translateX(-50%)',
                  height: '510px',
                  width: '500px',
                  zIndex: '-1',
                  [theme.breakpoints.up('md')]: {
                    height: '490px',
                  },
                })}
              >
                <Image
                  src="/images/labReport/rings.svg"
                  layout="fill"
                  objectFit="contain"
                  alt="rings"
                />
              </Box>

              <Box
                sx={(theme) => ({
                  '& > div': {
                    position: 'absolute',
                    boxShadow: '0px 9px 5px rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.2s ease-in-out',

                    '&:hover': {
                      boxShadow: '0px 9px 5px rgba(0, 0, 0, 0.5)',
                      transform: 'scale(1.35)',
                    },
                    [theme.breakpoints.down('lg')]: {
                      display: 'none',
                    },
                    [theme.breakpoints.up('xxl')]: {
                      transform: 'scale(1.3)',
                    },
                    [theme.breakpoints.down('xxl')]: {
                      transform: 'scale(1.3)',
                    },
                  },
                })}
              >
                {metricDetail?.data.report.metrics.map((metric, i) => (
                  <Box
                    sx={positionStyles[metric.cardPositionName]}
                    key={i.toString()}
                  >
                    <MetricCard
                      onMouseOver={setMouseOver}
                      metric={metric}
                      autoMetricAnimation={false}
                    />
                  </Box>
                ))}
              </Box>
              <LeaderLines
                metrics={metricDetail?.data.report.metrics!}
                animationTracker={mouseOver}
              />
            </Box>
          </>
        )}
      </Box>
    </UserSessionProvider>
  );
};

export default LabReport;
