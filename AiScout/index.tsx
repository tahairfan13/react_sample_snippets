import { Box } from '@mui/system';
import { Metric } from 'hooks/react-query/useMetricDetails';
import React from 'react';
import { useRecoilState } from 'recoil';
import { showDetailedMetric } from 'state/atoms';

import CheckMark from './CheckMark';
import DoubleProgressBar from './DoubleProgressBar';
import EllipseGradient from './EllipseGradient';
import InfoCircle from './InfoCircle';
import MetricName from './MetricName';
import MetricTime from './MetricTime';
import NotMeasured from './NotMeasured';
import RadialBar from './RadialBar';
import SingleProgressBar from './SingleProgressBar';
import Value from './Value';

interface Props {
  metric: Metric;
  autoMetricAnimation: boolean;
  onMouseOver: any;
}

const Index: React.FC<Props> = ({
  metric,
  autoMetricAnimation,
  onMouseOver,
}) => {
  const [showDetails, setShowDetails] = useRecoilState(showDetailedMetric);

  let cardMarks = () => {
    if (
      metric.measurements[0] === undefined ||
      metric.measurements[0].value === undefined
    ) {
      return '';
    } else {
      return metric.measurements[0].value;
    }
  };

  let cardTotalMarks = () => {
    if (metric.measurements[0] === undefined) {
      return '';
    } else if (metric.metricType === 'measurement') {
      return metric.measurements[0].unit;
    } else {
      return metric.measurements[0].unitAbbreviation;
    }
  };

  let filterTotalMarks = () => {
    if (cardTotalMarks() === undefined || cardTotalMarks() === null) {
      return 0;
    } else if (cardTotalMarks().includes('/')) {
      return cardTotalMarks().slice(1) === undefined
        ? 0
        : Number(cardTotalMarks().slice(1));
    }
  };

  const getValueForMeasurementType = (
    type: 'Left' | 'Right' | 'Difference',
    property: keyof typeof metric.measurements[number]
  ) => {
    let measurementType: typeof metric.measurements[number] | undefined;
    // This is hacky and we should make this explicit from the API by specifying
    // which Measurement returned has which function....
    if (type === 'Difference') {
      measurementType = metric.measurements.find(
        (measurement) =>
          !measurement.name.includes('Left') &&
          !measurement.name.includes('Right')
      );
    } else {
      measurementType = metric.measurements.find((measurement) =>
        measurement.name.includes(type)
      );
    }

    const value = (measurementType && measurementType[property]) || '';

    return value;
  };

  const totalGraphMarks = () => {
    if (metric.measurements.length === 0) {
      return '';
    } else {
      return metric.measurements[0].maxValue;
    }
  };
  const unitSave = () => {
    if (metric.measurements.length !== 0) {
      return metric.measurements[0].unit;
    }
  };

  const getDblUnit = () => {
    if (metric.measurements[1] === undefined) {
      return '';
    } else {
      return metric.measurements[1].unitAbbreviation;
    }
  };

  const getSeconds = metric.metricType === 'measurement' ? unitSave() : '';

  const setDetails = () => {
    setShowDetails({
      title: metric.name,
      open: !showDetails.open,
      type: metric.metricType,
      trialType: metric.trialType,
      tips: metric.tips,
      description: metric.description,
      cardMarks: cardMarks(),
      cardTotalMarks: cardTotalMarks(),
      cardDblMarks: getValueForMeasurementType('Left', 'value')!,
      cardDblTotalMarks: getValueForMeasurementType('Left', 'maxValue')!,
      cardDblMarks2: getValueForMeasurementType('Right', 'value')!,
      cardDblTotalMarks2: getValueForMeasurementType('Right', 'maxValue')!,
      unit: unitSave()!,
      graphMarks: totalGraphMarks(),
      filterTotalMarks: filterTotalMarks()!,
      getDblUnit: getDblUnit(),
      benchmarks: metric.benchmarks,
      getSeconds: getSeconds!,
    });
  };

  return (
    <Box
      sx={{
        display: metric.cardPositionName ? 'block' : 'none',
        background:
          'linear-gradient(180deg,  rgba(20, 81, 112, 0.48) 0%, rgba(0, 0, 0, 0) 100%)',
        width: '200px',
        height: '129px',
        clipPath: 'polygon(85% 0, 100% 22%, 100% 100%, 0 100%, 0 0)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderImageSource:
          'linear-gradient( 180deg, #6de3e4 0%, rgba(109, 227, 228, 0.41) 100% )',
        borderImageSlice: '1',
        position: 'relative',
        '&:hover': {
          '& > span': {
            opacity: '1',
          },
        },
        '& > span': {
          display: 'block',
          opacity: autoMetricAnimation ? '1' : '0',
          position: 'absolute',
          transition: 'all 0.3s ease-in-out',
          animation: '8s infinite flash',
          animationTimingFunction: 'linear',

          '@keyframes flash': {
            '0%': {
              top: '-3px',
              left: '-3px',
            },
            '25%': {
              top: '-3px',
              left: '170px',
            },
            '40%': {
              top: '25px',
              left: '195px',
            },
            '60%': {
              top: '98%',
              left: '195px',
            },
            '80%': {
              top: '98%',
              left: '-3px',
            },
            '100%': {
              top: '-3px',
              left: '-3px',
            },
          },

          '&:before': {
            content: '""',
            position: 'absolute',
            top: '0px',
            left: '0px',
            display: 'block',
            width: '8px',
            height: '8px',
            filter: 'blur(3px)',
            background: '#fff',
            borderRadius: '50%',
            zIndex: 1,
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            width: '12px',
            height: '12px',
            filter: 'blur(5px)',
            background: '#6de3e4',
            borderRadius: '50%',
            zIndex: 1,
            display: 'block',
          },
        },

        '&:before': {
          content: '""',
          width: '80px',
          height: '41px',
          transform:
            metric.metricType === 'compare'
              ? 'rotate(45deg)'
              : 'rotate(43.7deg)',
          top: '12px',
          right: '-16px',
          display: 'block',
          clipPath: 'polygon(100% 0, 0 0, 1000% 100%)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderImageSource:
            'linear-gradient( 180deg, #6de3e4 0%, rgba(109, 227, 228, 0.41) 100% )',
          borderImageSlice: '1',
          position: 'absolute',
        },
      }}
      onMouseEnter={() =>
        onMouseOver({
          cardPositionName: metric.cardPositionName,
          mouseOver: true,
          trialType: metric.trialType,
        })
      }
      onMouseLeave={() =>
        onMouseOver({
          cardPositionName: metric.cardPositionName,
          mouseOver: false,
          trialType: metric.trialType,
        })
      }
    >
      <span></span>
      {cardMarks() ? '' : <EllipseGradient />}

      {cardMarks() ? '' : <NotMeasured metric={metric} />}
      {cardMarks() !== '' ? (
        <>
          <MetricName metric={metric} />
          <EllipseGradient />

          {/* checkmark */}

          {metric.metricType === 'elite' ? <CheckMark /> : ''}

          {metric.metricType !== 'donut' && metric.metricType !== 'elite' ? (
            <Value>
              {metric.metricType === 'compare' ? (
                <>
                  {getValueForMeasurementType('Difference', 'value')}
                  <Box
                    component="span"
                    sx={{
                      fontSize: '28px',
                      fontFamily: 'Brandon Grotesque Bold',
                    }}
                  >
                    {getValueForMeasurementType(
                      'Difference',
                      'unitAbbreviation'
                    )}
                  </Box>
                </>
              ) : (
                cardMarks()
              )}
            </Value>
          ) : (
            ''
          )}

          {metric.metricType === 'elite' ? (
            <Value>{metric.measurements[0].value}</Value>
          ) : (
            ''
          )}

          {metric.metricType === 'progress' ? (
            <SingleProgressBar
              trialType={metric.trialType}
              cardMarks={cardMarks()}
              totalBarMarks={filterTotalMarks()}
              totalCardMarks={cardTotalMarks()}
            />
          ) : (
            ''
          )}

          {metric.metricType === 'compare' ? (
            <>
              <Box component="div" sx={{ marginTop: '-3px' }}>
                <DoubleProgressBar
                  trialType={metric.trialType}
                  metric={metric}
                  value={getValueForMeasurementType('Left', 'value')}
                  maxValue={getValueForMeasurementType('Left', 'maxValue')}
                  unit={getValueForMeasurementType('Left', 'unitAbbreviation')}
                  side="Left"
                />
              </Box>
              <DoubleProgressBar
                trialType={metric.trialType}
                metric={metric}
                value={getValueForMeasurementType('Right', 'value')}
                maxValue={getValueForMeasurementType('Right', 'maxValue')}
                unit={getValueForMeasurementType('Right', 'unitAbbreviation')}
                side="Right"
              />
            </>
          ) : (
            ''
          )}

          {metric.metricType === 'measurement' ? (
            <MetricTime metric={metric} />
          ) : (
            ''
          )}

          {metric.metricType === 'donut' ? (
            <RadialBar
              now={Number(cardMarks())}
              max={Number(totalGraphMarks())}
            />
          ) : (
            ''
          )}
        </>
      ) : (
        ''
      )}
      <InfoCircle setDetails={() => setDetails()} />
    </Box>
  );
};

export default Index;
