exports.dateFormater = (txt) => {
    const arrTxt = txt.replace(',', '').split(" ");
    const newTxt = [arrTxt[0], arrTxt[2], arrTxt[1], arrTxt[3]];
    return newTxt.join(" ");
}