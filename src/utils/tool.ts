export const mergeArray = (arr1: any[], arr2: any[]) => {
  const newArr = [...arr1, ...arr2];
  return newArr.reduce((acc, item) => {
    const index = acc.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      acc[index] = item;
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
};
