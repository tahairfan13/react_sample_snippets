import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Box, IconButton, Typography } from '@mui/material';
import BenchmarkSelect from 'components/ChartBoard/BenchmarkSelect';
import PolarChart from 'components/ChartBoard/PolarChart';
import ProgressBars from 'components/ChartBoard/ProgressBars';
import RadialChart from 'components/ChartBoard/RadialChart';
import DblRadialChart from 'components/DblRadialChart';
import Image from 'components/Image';
import ReportTitle from 'components/ReportTitle';
import DotsAnimation from 'components/UI/DotsAnimation';
import UserSessionProvider from 'components/UserSessionProvider';
import { useMetricDetails } from 'hooks/react-query/useMetricDetails';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';

const PerformanceChartBoard = () => {
  const { status: metricDetailLoadingStatus, data: metricDetail } =
    useMetricDetails();
  const [metricData, setMetricData] = useState<any[]>([]);
  // We have to do this as state as the Polar chart takes a while to load even
  // after API data is returned
  const [polarChartLoading, setPolarChartLoading] = useState(true);

  const router = useRouter();
  const style = useSpring({
    loop: { reverse: false },
    from: { x: 2000 },
    to: { x: 0 },
  });

  const style_mobile = useSpring({
    loop: { reverse: false },
    from: { y: 2000 },
    to: { y: 0 },
  });

  let type1: Array<number> = [];
  let type2: Array<number> = [];

  useEffect(() => {
    function getMarks() {
      return metricDetail!.data.report.metrics.map((metric) => {
        let rating = (metric.ratings.rating / metric.ratings.maxRating) * 10;
        return {
          metricName: metric.name.toUpperCase(),
          Physical: metric.trialType !== 1 ? Math.round(rating) : 0,
          Cognitive: metric.trialType === 1 ? Math.round(rating) : 0,
          trialType: metric.trialType,
          maxScore: 10,
        };
      });
    }
    if (metricDetailLoadingStatus === 'success') {
      setMetricData(getMarks());
    }
  }, [metricDetailLoadingStatus, setMetricData, metricDetail]);

  const filteredEmptyMetrics = metricDetail?.data.report.metrics.filter(
    (arr) => {
      return arr.ratings.rating;
    }
  );

  // Getting the score out of 10 and separating them into each trial type
  filteredEmptyMetrics?.forEach((element: any, i: number) => {
    if (element.trialType === 2) {
      type1[i] = (element.ratings.rating / element.ratings.maxRating) * 10;
    } else {
      type2[i] = (element.ratings.rating / element.ratings.maxRating) * 10;
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

  // Function for calculating the average of the score array

  const average = (arr: Array<number>) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const average1 = parseFloat(average(trialType1).toFixed(1)) || 0;
  const average2 = parseFloat(average(trialType2).toFixed(1)) || 0;

  // Getting score and max score for each metric
  const ratingSums = filteredEmptyMetrics?.reduce(
    (total, current) => {
      return {
        score: total.score + current.ratings.rating,
        maxScore: total.maxScore + current.ratings.maxRating,
      };
    },
    { score: 0, maxScore: 0 }
  ) || { score: 0, maxScore: 0 };

  const averageScore =
    parseFloat(((ratingSums.score / ratingSums.maxScore) * 10).toFixed(1)) || 0;

  return (
    <UserSessionProvider allowUnauthenticated>
      <Box
        sx={(theme) => ({
          background: `url(${process.env.NEXT_PUBLIC_BASE_PATH}/images/chartboard/chart-bg.png), #051521`,
          backgroundRepeat: 'no-repeat !important',
          backgroundSize: 'cover !important',
          overflow: 'hidden',
          height: '100vh',
          width: '100%',
          [theme.breakpoints.down('lg')]: {
            display: 'none',
          },
        })}
      >
        <animated.div
          style={{
            ...style,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
            onClick={() =>
              router.push({
                pathname: '/performancelabreport',
                query: { ...router.query }, // Pass through any query params
              })
            }
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '18.52px',
                marginTop: '40px',
                marginLeft: '25px',
                '& p': {
                  marginBottom: '0px',
                  fontWeight: '400',
                  fontSize: '20px',
                  lineHeight: '28px',
                  textTransform: 'uppercase',
                },
                '& span': {
                  cursor: 'pointer',
                },
              }}
            >
              <IconButton>
                <KeyboardBackspaceIcon />
              </IconButton>

              <p>Overall metrics</p>
            </Box>
            <Box
              sx={{
                marginTop: '30px',
                marginRight: '30px',
                cursor: 'pointer',
              }}
            >
              <Image
                src="/images/labReport/aiLogo.svg"
                width="64"
                height="64"
                alt="aiLogo"
              />
            </Box>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              zIndex: '1',
            }}
          >
            <ReportTitle metricDetail={metricDetail?.data} />
            <RadialChart
              chartState={polarChartLoading}
              cognitive={average1}
              physical={average2}
              hideInfoImg={true}
            />
            <BenchmarkSelect
              chartState={polarChartLoading}
              metricData={metricDetail?.data.report.metrics}
            />
          </Box>
          <Box
            sx={{
              marginTop: '450px',
            }}
          >
            <PolarChart
              loadingState={setPolarChartLoading}
              polarChartLoading={polarChartLoading}
              averageScore={averageScore}
            />
          </Box>
        </animated.div>
        <Box
          sx={(theme) => ({
            position: 'fixed',
            right: '30px',
            bottom: '8px',
            width: '164px',
            height: '64px',
            [theme.breakpoints.down('lg')]: {
              display: 'none',
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
      </Box>
      <Box
        sx={(theme) => ({
          width: '100%',
          height: '100vh',
          background: `url(${process.env.NEXT_PUBLIC_BASE_PATH}/images/chartboard/chart-bg-img.svg), var(--dark-theme-color)`,
          backgroundRepeat: 'no-repeat !important',
          backgroundSize: 'cover !important',
          overflow: 'hidden',
          [theme.breakpoints.up('lg')]: {
            display: 'none',
          },
        })}
      >
        <animated.div
          style={{
            ...style_mobile,
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              marginTop: '30px',
              paddingBottom: '30px',
              borderBottom: '1px solid #8c8c8c',
              '& h1': {
                fontWeight: '400',
                fontSize: '48px',
                lineHeight: '58px',
                marginBottom: '0px',
              },
              '& p': {
                fontWeight: '400',
                fontSize: '12px',
                lineHeight: '20px',
                color: '#bfbfbf !important',
                textTransform: 'uppercase',
                marginBottom: '0px',
              },
            }}
          >
            <Box
              sx={(theme) => ({
                position: 'absolute',
                top: '20px',
                right: '25px',
                cursor: 'pointer',
                [theme.breakpoints.up('lg')]: {
                  display: 'none',
                },
              })}
              onClick={() =>
                router.push({
                  pathname: '/performancelabreport',
                  query: { ...router.query }, // Pass through any query params
                })
              }
            >
              <Image
                src="/images/detailedmetric/cross.svg"
                alt="cross"
                width="18"
                height="18"
              />
            </Box>
            {metricDetailLoadingStatus === 'loading' ? (
              <DotsAnimation />
            ) : (
              <Typography sx={{ justifyContent: 'center' }} variant="h1">
                {averageScore}
              </Typography>
            )}
            <p>Average Score</p>
          </Box>
          <Box
            sx={{
              transform: 'scale(0.7)',
              marginTop: '-50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              '& > div:nth-child(1)': {
                transform: 'scale(0.85)',
              },
              '& > div:nth-child(2)': {
                '& > div': {
                  '& > div': {
                    marginLeft: '0px',
                    '&::before': {
                      display: 'none',
                    },
                  },
                },
              },
              '& > div:nth-child(3)': {
                display: 'flex',
                '& img': {
                  display: 'none !important',
                },
              },
            }}
          >
            <DblRadialChart
              cognitive={average1}
              physical={average2}
              hideInfoImg={false}
            />
          </Box>
          <ProgressBars
            loadingStatus={metricDetailLoadingStatus}
            metricData={metricData}
          />
        </animated.div>
      </Box>
    </UserSessionProvider>
  );
};

export default PerformanceChartBoard;
