export function group (ar, comparator, sorter) {
    if(sorter) {
        ar.sort(sorter);
    }

    return ar.reduce((groups, item) => {
        const lastGroup = !!groups.length && groups[groups.length - 1];
        if (lastGroup && lastGroup.length && comparator(item, lastGroup[0])) {
            lastGroup.push(item);
        } else {
            groups.push([item]);
        }

        return groups;
    }, []);
}