import { PrismaClient } from '@prisma/client';

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  console.log('[Seed] Ensuring default site settings exist...');
  const existingSettings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  if (!existingSettings) {
    await prisma.siteSetting.create({
      data: {
        id: 'default',
        heroHeading: 'Your Next Mission Starts Here.',
        heroSubtitle: 'Explore the universe of technology through hands-on coding sessions, orbital programming workshops, and interplanetary software engineering.',
        aboutText: 'Quazar Labs is a forward-thinking technology education venture committed to demystifying modern software engineering. We guide aspiring developers through hands-on coding missions, real-world architecture breakdowns, and deep technical mastery. Inspired by space exploration, our missions take you from planetary foundations to deep-galaxy breakthroughs.',
        contactEmail: 'missions@quazarlabs.space',
        githubUrl: 'https://github.com/quazar-labs',
        discordUrl: 'https://discord.gg/quazarlabs',
        youtubeUrl: 'https://youtube.com/@quazarlabs',
        footerText: 'Knowledge Beyond Orbit. Crafted for builders and cosmos explorers.'
      }
    });
  }

  console.log('[Seed] Populating Learning Paths and Dummy Sessions...');

  // 1. Planet C++
  const existingCpp = await prisma.learningPath.findUnique({ where: { slug: 'planet-cpp' } });
  if (!existingCpp) {
    await prisma.learningPath.create({
      data: {
        title: 'Planet C++: Systems & Fundamentals',
        slug: 'planet-cpp',
        description: 'Master low-level architecture, memory models, pointers, and modern C++20 for high-performance systems engineering.',
        learningObjectives: 'Understand stack vs heap memory management; Master pointers, references, and RAII; Implement high-performance data structures in C++; Learn modern C++ standard library idioms.',
        planetTheme: 'blue-terrestrial',
        accentColor: '#38BDF8',
        featured: true,
        publicationStatus: 'PUBLISHED',
        displayOrder: 1,
        workshops: {
          create: [
            {
              title: 'Deep Space C++: Systems Programming From Scratch',
              slug: 'deep-space-cpp',
              description: 'A comprehensive hands-on workshop guiding you from pointer arithmetic to writing an orbital physics simulation in C++.',
              learningObjectives: 'Write robust C++ code with zero memory leaks; Master RAII and smart pointers (std::unique_ptr, std::shared_ptr); Implement custom allocators and multi-threaded event loops; Build an orbital celestial telemetry engine.',
              difficulty: 'Beginner',
              estimatedDuration: '4 Weeks (8 Sessions)',
              publicationStatus: 'PUBLISHED',
              displayOrder: 1,
              weeks: {
                create: [
                  {
                    weekNumber: 1,
                    title: 'Week 01: Launch Sequence & Memory Architecture',
                    description: 'Setting up the toolchain (GCC/Clang/CMake), understanding computer architecture, registers, and the memory layout.',
                    displayOrder: 1,
                    publicationStatus: 'PUBLISHED',
                    sessions: {
                      create: [
                        {
                          title: 'Session 01: The Spacecraft Computer & Compilation Pipeline',
                          description: 'How source code becomes machine instructions. Preprocessor, compiler, assembler, and linker visualized.',
                          youtubeUrl: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
                          youtubeVideoId: 'vLnPwxZdW4Y',
                          duration: '48m 15s',
                          topics: 'Compilers, CMake, Memory Layout, Data Types, Preprocessor Macros',
                          displayOrder: 1,
                          publicationStatus: 'PUBLISHED',
                          lessonNotes: `### Mission Briefing: The Compilation Pipeline

In systems engineering, understanding the translation from C++ code to bare-metal execution is paramount.

#### 1. The Four Stages of Compilation
- **Preprocessing:** Resolves directives (\`#include\`, \`#define\`, \`#ifdef\`)
- **Compilation:** Translates preprocessed code into assembly instructions
- **Assembly:** Converts assembly into machine code object files (\`.o\` / \`.obj\`)
- **Linking:** Combines object files and external libraries into the final executable

\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "[TELEMETRY] Orbit coordinates locked: 42.109, -71.058\\n";
    return 0;
}
\`\`\`

#### Key Takeaways
- Always verify compiler warnings with \`-Wall -Wextra -Wpedantic\`.
- Memory is organized into **Code Segment**, **Data Segment**, **Heap**, and **Stack**.
`,
                          resources: {
                            create: [
                              {
                                title: 'Mission 01 Starter Repository (GitHub)',
                                url: 'https://github.com/quazar-labs/cpp-orbit-starter',
                                resourceType: 'CODE',
                                description: 'CMake configuration and telemetry boilerplate code.'
                              },
                              {
                                title: 'C++ Memory Layout Cheat Sheet (PDF)',
                                url: 'https://quazarlabs.space/docs/cpp-memory-layout.pdf',
                                resourceType: 'DOCUMENT',
                                description: 'Visual diagram of stack frames and memory segments.'
                              }
                            ]
                          }
                        },
                        {
                          title: 'Session 02: Pointers, References, and Deep Space Addresses',
                          description: 'Direct memory addressing, dereferencing, pointer arithmetic, and reference semantics.',
                          youtubeUrl: 'https://www.youtube.com/watch?v=8jLOx1hD3_o',
                          youtubeVideoId: '8jLOx1hD3_o',
                          duration: '54m 30s',
                          topics: 'Pointers, References, Dereferencing, Pointer Arithmetic, nullptr safety',
                          displayOrder: 2,
                          publicationStatus: 'PUBLISHED',
                          lessonNotes: `### Mission Briefing: Memory Pointers

A pointer is simply a variable that holds the physical address of another variable in memory.

#### Pointer vs Reference
- A **pointer** can be null and can be reassigned to point to different addresses.
- A **reference** is an alias for an existing object and cannot be null once bound.

\`\`\`cpp
int thrustLevel = 100;
int* pThrust = &thrustLevel; // Address of thrustLevel

*pThrust = 120; // Modifies thrustLevel directly!
std::cout << "Thrust: " << thrustLevel << "%\\n"; // Outputs 120%
\`\`\`

#### Rules for Safe Navigation
1. Never leave raw pointers uninitialized; initialize to \`nullptr\`.
2. Avoid dangling pointers by setting deleted pointers to \`nullptr\` or using RAII smart pointers.
`,
                          resources: {
                            create: [
                              {
                                title: 'Pointer Operations Interactive Exercise',
                                url: 'https://godbolt.org/z/quazar-pointers',
                                resourceType: 'LINK',
                                description: 'Compiler Explorer sandbox with assembly output.'
                              }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    weekNumber: 2,
                    title: 'Week 02: Orbital Dynamics & Smart Pointers (RAII)',
                    description: 'Resource Acquisition Is Initialization (RAII), std::unique_ptr, std::shared_ptr, and memory leak prevention.',
                    displayOrder: 2,
                    publicationStatus: 'PUBLISHED',
                    sessions: {
                      create: [
                        {
                          title: 'Session 03: Modern RAII and Ownership Semantics',
                          description: 'Never write raw delete again. Learn how C++ smart pointers manage lifecycle automatically.',
                          youtubeUrl: 'https://www.youtube.com/watch?v=rubv3x5vK44',
                          youtubeVideoId: 'rubv3x5vK44',
                          duration: '52m 10s',
                          topics: 'RAII, std::unique_ptr, std::make_unique, Move Semantics, Destructors',
                          displayOrder: 1,
                          publicationStatus: 'PUBLISHED',
                          lessonNotes: `### Mission Briefing: RAII & Smart Pointers

RAII guarantees that resources are acquired in a constructor and released in the destructor when the object leaves scope.

\`\`\`cpp
#include <memory>

class SpaceProbe {
public:
    SpaceProbe(std::string name) : id(name) {
        std::cout << "Probe " << id << " deployed.\\n";
    }
    ~SpaceProbe() {
        std::cout << "Probe " << id << " recovered safely.\\n";
    }
private:
    std::string id;
};

void runMission() {
    auto voyager = std::make_unique<SpaceProbe>("Voyager-3");
    // Memory freed automatically when runMission ends!
}
\`\`\`
`,
                          resources: {
                            create: [
                              {
                                title: 'Smart Pointers Benchmark Code',
                                url: 'https://github.com/quazar-labs/cpp-smart-pointers',
                                resourceType: 'CODE',
                                description: 'Performance comparison of raw vs unique vs shared pointers.'
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });
  }

  // 2. Binary Nebula (DSA)
  const existingDsa = await prisma.learningPath.findUnique({ where: { slug: 'binary-nebula' } });
  if (!existingDsa) {
    await prisma.learningPath.create({
      data: {
        title: 'Binary Nebula: Data Structures & Algorithms',
        slug: 'binary-nebula',
        description: 'Explore asymptotic complexity, graph traversals, dynamic programming, and scalable algorithmic design.',
        learningObjectives: 'Master Big-O analysis; Design trees, tries, and priority queues; Solve complex dynamic programming challenges; Implement shortest-path algorithms for interplanetary routing.',
        planetTheme: 'purple-gas-giant',
        accentColor: '#8B5CF6',
        featured: true,
        publicationStatus: 'PUBLISHED',
        displayOrder: 2,
        workshops: {
          create: [
            {
              title: 'Orbital Algorithms & Space-Complexity Optimization',
              slug: 'orbital-algorithms',
              description: 'Navigate algorithmic universes from binary search trees to Dijkstra and A* pathfinding across planetary networks.',
              difficulty: 'Intermediate',
              estimatedDuration: '6 Weeks (12 Sessions)',
              publicationStatus: 'PUBLISHED',
              displayOrder: 1,
              weeks: {
                create: [
                  {
                    weekNumber: 1,
                    title: 'Week 01: Complexity Analysis & Binary Search Foundations',
                    description: 'Asymptotic notation, logarithmic scales, and recursive divide-and-conquer strategies.',
                    displayOrder: 1,
                    publicationStatus: 'PUBLISHED',
                    sessions: {
                      create: [
                        {
                          title: 'Session 01: Asymptotic Telemetry — Time and Space Complexity',
                          description: 'How to calculate Big-O, Big-Omega, and Big-Theta for celestial scale computations.',
                          youtubeUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
                          youtubeVideoId: 'RBSGKlAvoiM',
                          duration: '46m 20s',
                          topics: 'Big-O Notation, Time Complexity, Space Complexity, Master Theorem',
                          displayOrder: 1,
                          publicationStatus: 'PUBLISHED',
                          lessonNotes: `### Mission Briefing: Big-O Complexity

When computing trajectory calculations across millions of stellar bodies, linear O(N) versus logarithmic O(log N) algorithms determine whether a calculation takes 1 millisecond or 3 weeks.

| Notation | Name | Practical Limit for N = 10^7 |
|---|---|---|
| O(1) | Constant | Instantaneous |
| O(log N) | Logarithmic | ~24 operations |
| O(N) | Linear | Feasible (< 0.1s) |
| O(N log N) | Linearithmic | Feasible (~1s) |
| O(N^2) | Quadratic | Exceeds CPU threshold |
`
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });
  }

  // 3. Cyber Orbit (Cybersecurity)
  const existingCyber = await prisma.learningPath.findUnique({ where: { slug: 'cyber-orbit' } });
  if (!existingCyber) {
    await prisma.learningPath.create({
      data: {
        title: 'Cyber Orbit: Defensive & Offensive Security',
        slug: 'cyber-orbit',
        description: 'Defend orbital communication grids, analyze vulnerabilities, master cryptography, and reverse engineer binary payloads.',
        learningObjectives: 'Understand TCP/IP security protocols; Exploit buffer overflows in controlled environments; Implement zero-trust authorization systems; Audit smart contracts and web applications.',
        planetTheme: 'cyber-ringed',
        accentColor: '#10B981',
        featured: true,
        publicationStatus: 'PUBLISHED',
        displayOrder: 3,
        workshops: {
          create: [
            {
              title: 'Mission Critical Security: Vulnerability Analysis & Hardening',
              slug: 'mission-critical-security',
              description: 'Learn the defensive and offensive arts required to protect interplanetary satellite constellations and secure web endpoints.',
              difficulty: 'Intermediate',
              estimatedDuration: '4 Weeks',
              publicationStatus: 'PUBLISHED',
              displayOrder: 1,
              weeks: {
                create: [
                  {
                    weekNumber: 1,
                    title: 'Week 01: Network Reconnaissance & Packet Telemetry',
                    description: 'Deep packet inspection with Wireshark, port scanning with Nmap, and network protocol fundamentals.',
                    displayOrder: 1,
                    publicationStatus: 'PUBLISHED',
                    sessions: {
                      create: [
                        {
                          title: 'Session 01: Deep Space Packet Analysis',
                          description: 'Intercepting and analyzing network traffic to identify anomalies and unauthorized transmissions.',
                          youtubeUrl: 'https://www.youtube.com/watch?v=zOjov-2OZ0E',
                          youtubeVideoId: 'zOjov-2OZ0E',
                          duration: '50m 12s',
                          topics: 'Wireshark, TCP Handshake, Packet Dissection, Network Security',
                          displayOrder: 1,
                          publicationStatus: 'PUBLISHED',
                          lessonNotes: `### Mission Briefing: Packet Telemetry

Network communication occurs through layered protocols (OSI model). Every packet contains headers that describe source, destination, protocol, and payload checksums.
`
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });
  }

  // 4. AI Galaxy
  const existingAi = await prisma.learningPath.findUnique({ where: { slug: 'ai-galaxy' } });
  if (!existingAi) {
    await prisma.learningPath.create({
      data: {
        title: 'AI Galaxy: Neural Networks & Deep Learning',
        slug: 'ai-galaxy',
        description: 'Journey from mathematical perceptrons to attention-based transformers and autonomous agent architectures.',
        learningObjectives: 'Build neural networks from scratch in Python; Train convolutional networks for computer vision; Implement self-attention mechanisms and transformer decoders; Fine-tune open-weight models.',
        planetTheme: 'nebula-red',
        accentColor: '#F43F5E',
        featured: true,
        publicationStatus: 'PUBLISHED',
        displayOrder: 4,
        workshops: {
          create: [
            {
              title: 'Cosmic Neural Nets: Transformers & Generative AI',
              slug: 'cosmic-neural-nets',
              description: 'Build your own neural networks from first principles and discover the mathematics powering modern AI.',
              difficulty: 'Advanced',
              estimatedDuration: '8 Weeks',
              publicationStatus: 'PUBLISHED',
              displayOrder: 1,
              weeks: {
                create: [
                  {
                    weekNumber: 1,
                    title: 'Week 01: Perceptrons, Vectors, and Matrix Arithmetic',
                    description: 'Understanding linear algebra, tensors, activation functions, and gradient descent.',
                    displayOrder: 1,
                    publicationStatus: 'PUBLISHED',
                    sessions: {
                      create: [
                        {
                          title: 'Session 01: The Cosmic Perceptron and Forward Propagation',
                          description: 'Mathematical intuition behind artificial neurons and weight adjustment.',
                          youtubeUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
                          youtubeVideoId: 'aircAruvnKk',
                          duration: '42m 18s',
                          topics: 'Perceptrons, Forward Propagation, Sigmoid, ReLU, Dot Products',
                          displayOrder: 1,
                          publicationStatus: 'PUBLISHED',
                          lessonNotes: `### Mission Briefing: Neural Network Foundations

Neural networks approximate non-linear functions through chained matrix multiplications and non-linear activation functions.
`
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });
  }

  // 5. Webverse
  const existingWeb = await prisma.learningPath.findUnique({ where: { slug: 'webverse' } });
  if (!existingWeb) {
    await prisma.learningPath.create({
      data: {
        title: 'Webverse: Full-Stack Orbital Engineering',
        slug: 'webverse',
        description: 'Build high-performance distributed web applications with modern TypeScript, React, and Node.js microservices.',
        planetTheme: 'cosmic-cyan',
        accentColor: '#06B6D4',
        featured: false,
        publicationStatus: 'PUBLISHED',
        displayOrder: 5,
        workshops: {
          create: [
            {
              title: 'Distributed Deep Space Systems with Node & React',
              slug: 'deep-space-web-systems',
              description: 'Master full-stack architecture, real-time WebSocket communication, and cloud deployment pipelines.',
              difficulty: 'Intermediate',
              estimatedDuration: '6 Weeks',
              publicationStatus: 'PUBLISHED',
              displayOrder: 1,
              weeks: {
                create: [
                  {
                    weekNumber: 1,
                    title: 'Week 01: Asynchronous Event Loops & Server Architecture',
                    description: 'Deep dive into the Node.js event loop, non-blocking I/O, and RESTful API standards.',
                    displayOrder: 1,
                    publicationStatus: 'PUBLISHED',
                    sessions: {
                      create: [
                        {
                          title: 'Session 01: The Node.js Event Horizon',
                          description: 'How libuv processes microtasks, macrotasks, and network events without blocking.',
                          youtubeUrl: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
                          youtubeVideoId: '8aGhZQkoFbQ',
                          duration: '45m 00s',
                          topics: 'Event Loop, Callbacks, Promises, Async/Await, Microtasks',
                          displayOrder: 1,
                          publicationStatus: 'PUBLISHED',
                          lessonNotes: `### Mission Briefing: The Asynchronous Loop

Node.js executes JavaScript on a single thread while delegating I/O operations to operating system system calls via libuv.
`
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    });
  }

  console.log('[Seed] Database populated successfully with full space learning missions & dummy sessions.');
}
