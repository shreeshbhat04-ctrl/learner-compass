export type Language = "python" | "c" | "cpp" | "matlab" | "verilog" | "java" | "javascript" | "csharp" | "go" | "rust";

export interface Exercise {
    id: string;
    title: string;
    description: string; // Markdown supported
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: Language;
    template: string;
    solution?: string;
    testCases?: { input: string; output: string }[];
    hints?: string[];
}

export const exercises: Exercise[] = [
    {
        id: "python-factorial",
        title: "Factorials",
        description: `### Exercise: Factorials
Implement a recursive function to calculate the factorial of a number.

**Expected Output:** \`120\` for input \`5\`.`,
        difficulty: "beginner",
        language: "python",
        template: `# Write your Python code here
print('Hello, World!')
def factorial(n):
    return 1 if n <= 1 else n * factorial(n-1)

print(factorial(5))`,
        hints: ["Remember that 0! is 1", "Use recursion: n * factorial(n-1)"]
    },
    {
        id: "c-factorial",
        title: "Factorial Calculation",
        description: `### Exercise: Factorial Calculation
Write a program to calculate the factorial of a number using loops.

**Expected Output:** \`Factorial of 5 is 120\`
**Language:** C`,
        difficulty: "beginner",
        language: "c",
        template: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    int n = 5;
    int fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    printf("Factorial of %d is %d\\n", n, fact);
    return 0;
}`,
    },
    {
        id: "cpp-factorial",
        title: "Factorial Calculation",
        description: `### Exercise: Factorial Calculation
Write a program to calculate the factorial of a number using loops.

**Expected Output:** \`Factorial of 5 is 120\`
**Language:** C++`,
        difficulty: "beginner",
        language: "cpp",
        template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    int n = 5;
    int fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    cout << "Factorial of " << n << " is " << fact << endl;
    return 0;
}`,
    },
    {
        id: "matlab-sine-wave",
        title: "Signal Generation",
        description: `### Exercise: Signal Generation
Generate a sine wave using vector operations.

MATLAB/Octave is perfect for matrix manipulations and signal processing tasks.`,
        difficulty: "beginner",
        language: "matlab",
        template: `% Octave/MATLAB Script
x = 0:0.1:10;
y = sin(x);
disp('Generated sine wave data');
disp(y(1:5));`,
    },
    {
        id: "verilog-counter",
        title: "4-bit Counter",
        description: `### Exercise: 4-bit Counter
Design a simple 4-bit up-counter triggered on the positive edge of the clock.

**Goal:** Verify the timing diagram.`,
        difficulty: "intermediate",
        language: "verilog",
        template: `// Verilog Module
module counter(input clk, output reg [3:0] out);
  always @(posedge clk) begin
    out <= out + 1;
  end
endmodule`,
    },
    {
        id: "java-factorial",
        title: "Factorial in Java",
        description: `### Exercise: Factorial in Java
Implement a factorial calculation program in Java.

**Expected Output:** \`Factorial of 5 is 120\``,
        difficulty: "beginner",
        language: "java",
        template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        int n = 5;
        int fact = 1;
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        System.out.println("Factorial of " + n + " is " + fact);
    }
}`,
    },
    {
        id: "js-factorial",
        title: "JavaScript Functions",
        description: `### Exercise: JavaScript Functions
Write a recursive function to calculate factorial in JavaScript.

**Expected Output:** \`Factorial of 5 is 120\``,
        difficulty: "beginner",
        language: "javascript",
        template: `// JavaScript Code
console.log('Hello, World!');

function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

console.log('Factorial of 5 is', factorial(5));`,
    },
    {
        id: "csharp-factorial",
        title: "C# Console Application",
        description: `### Exercise: C# Console Application
Create a C# program to calculate factorial.

**Expected Output:** \`Factorial of 5 is 120\``,
        difficulty: "beginner",
        language: "csharp",
        template: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        int n = 5;
        int fact = 1;
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        Console.WriteLine($"Factorial of {n} is {fact}");
    }
}`,
    },
    {
        id: "go-factorial",
        title: "Go Programming",
        description: `### Exercise: Go Programming
Write a Go program to calculate factorial.

**Expected Output:** \`Factorial of 5 is 120\``,
        difficulty: "beginner",
        language: "go",
        template: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    n := 5
    fact := 1
    for i := 1; i <= n; i++ {
        fact *= i
    }
    fmt.Printf("Factorial of %d is %d\\n", n, fact)
}`,
    },
    {
        id: "rust-factorial",
        title: "Rust Programming",
        description: `### Exercise: Rust Programming
Implement a factorial calculation in Rust.

**Expected Output:** \`Factorial of 5 is 120\``,
        difficulty: "beginner",
        language: "rust",
        template: `fn main() {
    println!("Hello, World!");
    let n = 5;
    let mut fact = 1;
    for i in 1..=n {
        fact *= i;
    }
    println!("Factorial of {} is {}", n, fact);
}`,
    }
];

// Helper to get default template for a language (fallback)
export const getTemplateForLanguage = (lang: Language): string => {
    const exercise = exercises.find(e => e.language === lang);
    return exercise ? exercise.template : "// No template available";
};
