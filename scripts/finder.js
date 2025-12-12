const Finder = (() => {
    const START_OFFSET = 0
    const WINDOW_SIZE = 0.5
    const SEARCH_WIDTH = 2

    const getPointIdxByTime = (points, timeOffset) => {
        for (let index = 0; index < points.length; index++) {
            const point = array[index];
            if (point.timeOffserMs >= timeOffset) return index;
        }

        return -1
    }

    const getWindowAvg = (points = [], windowStartIdx, windowEndTime) => {
        let avg = 0
        for (let pointIdx = windowStartIdx; pointIdx<points.length && points[i].timeOffserMs < points[windowStartIdx]+windowSize; pointIdx++) {
            avg += points[pointIdx].pupilAvg;
        }
        avg /= window
    }
    const getWindowBaseline = (points = [], start, window) => {
        const avg = getWindowAvg(points, start, window);

        const baseline = {
            windowStart: start,
            variance: 0,
            avg: avg
        }

        for (let pointIdx = windowStart; pointIdx < windowStart+WINDOW_SIZE_MS; pointIdx++) {
            baseline.variance += Math.pow(points[pointIdx].pupilAvg - avg,2); 
        }

        return baseline
    }


    const calculateSessionBaseline = (points = []) => {
        const interpolatedPoints = points.map((p) => {return p.interpolated})

        
        let minBaseline = getWindowBaseline(interpolatedPoints, START_OFSET, WINDOW_SIZE_MS);
        let windowBaseline = {}

        for (let windowStart = START_OFFSET+1; windowStart < SEARCH_WIDTH_MS-WINDOW_SIZE_MS; windowStart++) {
            windowBaseline = getWindowBaseline(interpolatedPoints, windowStart, WINDOW_SIZE_MS);
            if (windowBaseline.variance < minBaseline.variance) {
                minBaseline = windowBaseline;
            } 
        }

        return minBaseline
    }

    return {
        calculateSessionBaseline
    }
})();
window.baselineFinder = Finder;