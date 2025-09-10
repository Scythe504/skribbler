export function generateID(n: number): string {
    const letterChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    
    for (let i = 0; i < n; i++) {
        result += letterChars[Math.floor(Math.random() * letterChars.length)];
    }
    
    return result;
}