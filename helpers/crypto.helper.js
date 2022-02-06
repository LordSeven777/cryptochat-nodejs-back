// Symetric key
const KEY = [14, 233, 59, 36, 197];
// Matrix size
const N = 5;

// Object containing the forward encryption
class Crypto {

    // Text
    text;

    // Direction
    isEncryption = true;

    // Forward key order
    forKeyOrder;

    // Reverse key order
    revKeyOrder;

    // N*N matrix
    matrix = [];

    // Logs the matrix
    logMatrix() {
        for (let i = 0; i < N; i++)
            console.log(this.matrix[i]);
        console.log("-------------------------");
    }

    // Initializes the key order
    initKeyOrder() {
        let i = -1;
        // this.forKeyOrder = KEY.map((val, j) => j);
        this.forKeyOrder = [0, 3, 2, 4, 1];
        this.revKeyOrder = [0, 4, 2, 1, 3];
    }

    // Forward matrix initialization
    forInit(plainText) {
        this.matrix = [];
        let row;
        for (let i = 0; i < N; i++) {
            row = [];
            for (let j = 0; j < N; j++) {
                const k = i * N + j;
                const char = plainText[k];
                row.push(char ? char.charCodeAt(0) : null);
            }
            this.matrix.push(row);
        }
        // this.logMatrix();
    }

    // Forward column addition
    forColAdd() {
        for (let j = 0; j < N; j++) {
            for (let i = 0; i < N; i++) {
                if (this.matrix[i][j] !== null) {
                    this.matrix[i][j] += KEY[i];
                    this.matrix[i][j] %= 256;
                }
            }
        }
        // this.logMatrix();
    }

    // Forward rows sorting
    forRowSort() {
        for (let i = 0; i < N - 1; i++) {
            const order = this.forKeyOrder[i];
            if (i !== order) {
                const tmp = this.matrix[order];
                this.matrix[order] = this.matrix[i];
                this.matrix[i] = tmp;
            }
        }
        // this.logMatrix();
    }

    // Forward rows addition
    forRowAdd() {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (this.matrix[i][j] !== null) {
                    this.matrix[i][j] += KEY[i];
                    this.matrix[i][j] %= 256;
                }
            }
        }
        // this.logMatrix();
    }

    // Forward columns sorting
    forColSort() {
        for (let j = 0; j < N - 1; j++) {
            const order = this.forKeyOrder[j];
            if (j !== order) {
                for (let i = 0; i < N; i++) {
                    const tmp = this.matrix[i][order];
                    this.matrix[i][order] = this.matrix[i][j];
                    this.matrix[i][j] = tmp;
                }
            }
        }
        // this.logMatrix();
    }

    // Returns the cipher text
    getCipherText() {
        let output = '';
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const value = this.matrix[this.revKeyOrder[i]][j]
                if (value !== null) 
                    output += String.fromCharCode(value);
            }
        }
        return output;
    }

    // The encryption algorithm
    encrypt() {
        let output = '';
        const partLength = N ** 2;
        const partsNb = Math.ceil(this.text.length / partLength);
        for (let i = 0; i < partsNb; i++) {
            const part = this.text.substring(i * partLength);
            this.forInit(part);
            this.forColSort();
            this.forRowAdd();
            this.forRowSort();
            this.forColAdd();
            output += this.getCipherText();
        }
        return output;
    }

    /*******  DECRYPTION ************************/

    // Reverse initialization of the matrix (from cipher to matrix)
    revInit(cipherText) {
        const length = cipherText.length;
        const lastRowIndex = Math.floor(length / N);
        const rest = length % N;

        // Matrix rows initialization
        for (let i = 0; i < N; i++)
            this.matrix[i] = [];

        for (let i = 0; i < N; i++) {
            const rowIndex = this.revKeyOrder[i];
            for (let j = 0; j < N; j++) {
                if (i <= lastRowIndex) {
                    const charIndex = i * N + j;
                    if (i < lastRowIndex)
                        this.matrix[rowIndex].push(cipherText.charCodeAt(charIndex));
                    else if (j < rest)
                        this.matrix[rowIndex].push(cipherText.charCodeAt(charIndex));
                    else
                        this.matrix[rowIndex].splice(this.revKeyOrder[j], 0, null);
                }
                else this.matrix[rowIndex].push(null);
            }
        }
        // console.log("-------------------------------------------------------------------------");
        // this.logMatrix();
    }

    // Reverse column sort
    revColSort() {
        for (let i = 0; i < N; i++) {
            const rowColumns = [];
            for (let j = 0; j < N; j++)
                rowColumns.push(this.matrix[i][this.revKeyOrder[j]]);
            this.matrix[i] = rowColumns;
        }
        // this.logMatrix();
    }

    // Reverse rows add
    revRowAdd() {
        for (let j = 0; j < N; j++) {
            for (let i = 0; i < N; i++) {
                if (this.matrix[i][j] === null) continue;
                const result = this.matrix[i][j] - KEY[i];
                this.matrix[i][j] = result >= 0 ? result : (256 + result);
            }
        }
        // this.logMatrix();
    }

    // Reverse rows sort
    revRowSort() {
        const matrix = [];
        for (let i = 0; i < N; i++) 
            matrix.push(this.matrix[this.revKeyOrder[i]]);
        this.matrix = matrix;
        // this.logMatrix();
    }

    // Reverse column addition
    revColAdd() {
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (this.matrix[i][j] === null) continue;
                const result = this.matrix[i][j] - KEY[i];
                this.matrix[i][j] = result >= 0 ? result : (256 + result);
            }
        }
        // this.logMatrix();
    }

    // Gets the plain text
    getPlainText() {
        let output = '';
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (this.matrix[i][j] === null) continue;
                output += String.fromCharCode(this.matrix[i][j]);
            }
        }
        return output;
    }

    // The decryption algorithm
    decrypt() {
        let output = '';
        const partLength = N ** 2;
        const partsNb = Math.ceil(this.text.length / partLength);
        for (let i = 0; i < partsNb; i++) {
            const part = this.text.substring(i * partLength);
            this.revInit(part);
            this.revColSort();
            this.revRowAdd();
            this.revRowSort();
            this.revColAdd();
            output += this.getPlainText();
        }
        return output;
    }

    constructor(text) {
        this.initKeyOrder();
        this.text = text;
    }

};

module.exports = Crypto;
