//==============================================================================//
//                               6502js/main.js/                                //
//==============================================================================//
//                          program by Aydon Joseph, 2023                       //
//==============================================================================//


/* MAIN VARIABLES
 * Main variables used for the emulator (e.g the program counter, registers etc.)
 */

var memory = [];
var program_counter = 0x0000;

// registers
var accumulator = 0x00;
var register_x = 0x00;
var register_y = 0x00;

var stack_pointer = 0x00;
//           N  V  -  B  D  I  Z  C
var flags = [0, 0, 0, 0, 0, 0, 0, 0];

/* INSTRUCTION FUNCTIONS
 * The functions below work as a framework so implementing the opcodes is easier
 */

// load/store instructions
var LDA = (value) => {
    accumulator = value;
    if (accumulator == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((accumulator & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var LDX = (value) => {
    register_x = value;
    if (register_x == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((register_x & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var LDY = (value) => {
    register_y = value;
    if (register_y == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((register_y & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var STA = (value) => {
    memory[value] = accumulator;
};
var STX = (value) => {
    memory[value] = register_x;
};
var STY = (value) => {
    memory[value] = register_y;
};

// transfer instructions
var TAX = (value) => {
    register_x = accumulator;
    if (register_x == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((register_x & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var TAY = (value) => {
    register_y = accumulator;
    if (register_y == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((register_y & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var TSX = (value) => {
    register_x = stack_pointer;
    if (register_x == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((register_x & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var TXA = (value) => {
    accumulator = register_x;
    if (accumulator == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((accumulator & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var TXS = (value) => {
    stack_pointer = register_x;
};
var TYA = (value) => {
    accumulator = register_y;
    if (accumulator == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((accumulator & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};

// stack instructions
var PHA = (value) => {
    if (stack_pointer < 0xFF) {
        memory[0x100 + stack_pointer] = accumulator;
        stack_pointer += 1;
    } else if (stack_pointer = 0xFF) {
        console.log("Stack full, cannot push");
    };
};
var PHP = (value) => {
    if (stack_pointer < 0xFF) {
        memory[0x100 + stack_pointer] = join_flags();
    } else if (stack_pointer = 0xFF) {
        console.log("Stack full, cannot push");
    };
};
var PLA = (value) => {
    accumulator = memory[0x100 + stack_pointer];
    stack_pointer -= 1;
    if (accumulator == 0) { flags[6] = 1; } else { flags[6] = 0; };
    if (((accumulator & 0b10000000) >> 7) == 1) { flags[0] = 1; } else { flags[0] = 0; };
};
var PLP = (value) => {
    load_flags(memory[0x100 + stack_pointer]);
    stack_pointer -= 1;
};

// shift instructions
var ASL = () => { };
var LSR = () => { };
var ROL = () => { };
var ROR = () => { };


/* BASIC FUNCTIONS
 * These functions help compact reused code (e.g fetching from memory) and help with readability
 */

// flag manipulation functions
function join_flags() {
    return flags[0] << 7 + flags[1] << 6 + flags[2] << 5 + flags[3] << 4 + flags [4] << 3 + flags[5] << 2 + flags[6] << 1 + flags[7];
};
function load_flags(value) {
    flags[0] = (0b10000000 & value) >> 7;
    flags[1] = (0b01000000 & value) >> 6;
    flags[2] = (0b00100000 & value) >> 5;
    flags[3] = (0b00010000 & value) >> 4;
    flags[4] = (0b00001000 & value) >> 3;
    flags[5] = (0b00000100 & value) >> 2;
    flags[7] = (0b00000000 & value) >> 0;
    flags[6] = (0b00000010 & value) >> 1;
}

// fetch functions
function fetch_16b(addr) {
    if(addr < 0xFFFF) {
        return memory[addr] & memory[addr] << 8;
    } else {
        return memory[addr - 0xFFFF] & memory[addr - 0xFFFF] << 8;
    }
};
function fetch_8b(addr) {
    if(addr <= 0xFFFF) {
        return memory[addr];
    } else {
        return memory[addr - 0xFFFF];
    }
};

// increment program_counter
function inc_pc(value) {
    if(program_counter == 0xFFFF) { 
        program_counter = value;
    } else {
        program_counter += value;
    }
};

/* ADDRESSING MODES
 * These functions  return  the  addresses where instructions can get their operands from
 */

function absolute(addr) {
    return (addr + 1) & ((addr + 2) << 8)
};
function absolute_x(addr) {
    return ((addr + 1) & ((addr + 2) << 8)) + register_x;
};
function absolute_y(addr) {
    return ((addr + 1) & ((addr + 2) << 8)) + register_y;
};
function immediate(addr) {
    return addr + 1;
};
function indirect(addr) {
    return fetch_16b( (addr + 1) & ((addr + 2) << 8) );
};
function indirect_x(addr) {
    return fetch_16b( (fetch_8b(addr) + register_x) );
};
function indirect_y(addr) {
    return fetch_16b( fetch_8b(addr) ) + register_y;
};
function relative(addr) {
    return addr + fetch_8b(addr + 1);
};
function zpg(addr) {
    return addr + 1;
};
function zpg_x(addr) {
    return (addr + 1) + register_x;
};
function zpg_y(addr) {
    return (addr + 1) + register_y;
};


// init function
var init = function() {
    memory = [];
    for (var i = 0; i <= 65536; i++) {
        memory.push(0x00);
    };
    console.log(memory);
    accumulator = 0x00;
    register_x = 0x00;
    register_y = 0x00;
    stack_pointer = 0x00;
    program_counter = fetch_16b(0xFFFC);
};

// main cpu function
var cpu = () => {

    // fetch & decode & execute
    switch (fetch_8b(program_counter)) {
        //LDA instruction
        case 0xA9:
            LDA(fetch_8b(immediate(program_counter)));
        case 0xAD:
            LDA(fetch_8b(absolute(program_counter)));
        case 0xBD:
            LDA(fetch_8b(absolute_x(program_counter)));
        case 0xB9:
            LDA(fetch_8b(absolute_y(program_counter)));
        case 0xA5:
            LDA(fetch_8b(zpg(program_counter)));
        case 0xB5:
            LDA(fetch_8b(zpg_x(program_counter)));
        case 0xA1:
            LDA(fetch_8b(indirect_x(program_counter)));
        case 0xB1:
            LDA(fetch_8b(indirect_y(program_counter)));
        //LDX instruction
        case 0xA2:
            LDX(fetch_8b(immediate(program_counter)));
        case 0xAE:
            LDX(fetch_8b(absolute(program_counter)));
        case 0xBE:
            LDX(fetch_8b(absolute_y(program_counter)));
        case 0xA6:
            LDX(fetch_8b(zpg(program_counter0)));
        case 0xB6:
            LDX(fetch_8b(zpg_y(program_counter)));
        //LDY instruction
        case 0xA0:
            LDY(fetch_8b(immediate(program_counter)));
        case 0xAC:
            LDY(fetch_8b(absolute(program_counter)));
        case 0xBC:
            LDY(fetch_8b(absolute_x(program_counter)));
        case 0xA4:
            LDY(fetch_8b(zpg(program_counter)));
        case 0xB4:
            LDY(fetch_8b(zpg_x(program_counter)));

    }

};

init();
