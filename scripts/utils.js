const EyeTrackerUtils = (() => {
  const computePupilAvg = (left, right) => {
    const values = [Number(left), Number(right)].filter((value) =>
      Number.isFinite(value)
    );
    if (values.length === 0) {
      return null;
    }
    
    const sum = values.reduce((acc, value) => acc + value, 0);
    let avg = sum / values.length;

    if (values.length > 1 && Math.abs(values[0]-values[1]) > 0.9) avg = (avg + Math.min(values[0],values[1]))/2;
    return avg;
  };

  return {
    computePupilAvg,
  };
})();

window.eyeTrackerUtils = EyeTrackerUtils;
