
export function addMasterBar(bar, score, index) {
    // Insert at the end of the tab
    if(index === score.masterBars.length) {
        bar.score = score;
        bar.index = score.masterBars.length;
        if (score.masterBars.length !== 0) {
            bar.previousMasterBar = score.masterBars[score.masterBars.length - 1];
            bar.previousMasterBar.nextMasterBar = bar;
            bar.start =
                bar.previousMasterBar.start +
                    (bar.previousMasterBar.isAnacrusis ? 0 : bar.previousMasterBar.calculateDuration());
        }
        score.addMasterBarToRepeatGroups(bar);
        score.masterBars.push(bar);
        return score;
    } else {
        bar.score = score;
        bar.index = index;
        if (score.masterBars.length !== 0) {
            if(index > 0) {
                // Insert in the middle of the tab
                score.masterBars[index - 1].nextMasterBar = bar;
                bar.previousMasterBar = score.masterBars[index - 1];
                bar.previousMasterBar.nextMasterBar = bar;
                bar.start = bar.previousMasterBar.start + (bar.previousMasterBar.isAnacrusis ? 0 : bar.previousMasterBar.calculateDuration());
            } else {
                // insert as first bar
                bar.previousMasterBar = null;
            }
            score.masterBars[index].previousMasterBar = bar;
            bar.nextMasterBar = score.masterBars[index];
            bar.nextMasterBar.previousMasterBar = bar;
        }
        score.addMasterBarToRepeatGroups(bar);
    
        for(let i = index; i < score.masterBars.length; i ++) {
            score.masterBars[i].index = score.masterBars[i].index + 1;
        }
    
        let newMasterBars = insert(score.masterBars, index, bar);
        score.masterBars = newMasterBars
    
    
        return score;
    }
}

export function addBar(bar, staff, index) {
    // Insert at the end of the tab
    if(index === staff.bars.length) {
        let bars = staff.bars;
        bar.staff = staff;
        bar.index = bars.length;
        if (bars.length > 0) {
            bar.previousBar = bars[bars.length - 1];
            bar.previousBar.nextBar = bar;
        }
        bars.push(bar);
        return bars;
    } else {
        let bars = staff.bars;
        bar.staff = staff;
        bar.index = index;
        // Insert in the middle of the tab
        if (bars.length > 0) {
            if(index > 0) {
                bars[index - 1].nextBar = bar;
                bar.previousBar = bars[index - 1];
                bar.previousBar.nextBar = bar;
            } else {
                // insert as first bar
                bar.previousBar = null;
            }
            bars[index].previousBar = bar;
            bar.nextBar =  bars[index];
            bar.nextBar.previousBar = bar;
        }
    
        for(let i = index; i < bars.length; i ++) {
            bars[i].index = bars[i].index + 1;
        }
    
        let newBars = insert(bars, index, bar);
    
        return newBars;
    }
}

function insert(arr, index, newItem) {
    return [
        ...arr.slice(0, index),
    
        newItem,
    
        ...arr.slice(index)]
};
